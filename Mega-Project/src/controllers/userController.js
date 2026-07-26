import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  isValidEmail,
  isValidUsername,
  isStrongPassword,
  isValidFullname,
} from "../utils/validators.js";
import jwt from "jsonwebtoken";

// Cookie options used across all auth endpoints that set/clear tokens.
// httpOnly: true  --> JS on the frontend cannot read/modify this cookie
//                     (document.cookie won't show it) - protects it
//                     from XSS-based token theft.
// secure: only forces HTTPS-only cookies in production. On localhost
//         (plain HTTP, during development), browsers silently refuse to
//         set a cookie marked secure: true over an insecure connection -
//         so this is tied to NODE_ENV to keep local testing working
//         while still being strict in production.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

// Generates a fresh access + refresh token pair for a given user, and
// persists the refresh token on the User document (see token-theory
// notes in userModel.js for WHY we store it DB-side - it's what lets
// us revoke sessions server-side later, e.g. on logout).
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the new refresh token to this user's DB record, so future
    // /refresh-token requests can be validated against it.
    user.refreshToken = refreshToken;

    // validateBeforeSave: false --> we're only updating ONE field
    // (refreshToken) here, not re-submitting the whole user object.
    // Without this, Mongoose would re-run validation on every schema
    // field (password strength, email format, etc.) on every login -
    // unnecessary and would likely fail since we don't have the raw
    // password in-hand here.
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Actual Error: ", error);
    throw new ApiError(500, "Failed to generate access and refresh tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Registration flow:
  // 1. Get user details from frontend (or Postman)
  // 2. Validate the provided data
  // 3. Check if user already exists (already registered via username or email)
  // 4. Check for images (and specially avatar - required field)
  // 5. Upload the images to Cloudinary
  // 6. Create user object, create entry in database
  // 7. Remove password and refresh token field from response
  // 8. Check if user successfully created, if yes then return response

  const { username, fullname, email, password } = req.body;

  // Step 1: check no field is empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are compulsory and required");
  }

  // Step 2: check each field is actually valid, not just "non-empty"
  if (!isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!isValidUsername(username)) {
    throw new ApiError(
      400,
      "Username must be 3-20 characters, lowercase letters/numbers/underscores/dots only"
    );
  }

  if (!isValidFullname(fullname)) {
    throw new ApiError(400, "Fullname must be between 3 and 50 characters");
  }

  if (!isStrongPassword(password)) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    );
  }

  // Step 3: check if user already exists - this is a DB call, so it
  // returns a Promise and must be awaited. Without await, existedUser
  // would be the Promise object itself, which is always truthy -
  // meaning this check would incorrectly block EVERY registration
  // attempt, since a Promise object is never falsy regardless of what
  // it eventually resolves to.
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists"); // 409 --> conflict
  }

  // Step 4: Multer has already placed the files in a temp folder on our server.
  // req.files comes from multer's .fields() middleware - each field name maps
  // to an array of file objects (even if only one file is uploaded per field).
  // Optional chaining is used at EVERY level (req.files?.avatar?.[0]?.path)
  // because any of these can be missing: req.files itself is undefined if
  // no files were sent at all, req.files.avatar is undefined if that
  // specific field was never attached, and without chaining at each step
  // this would throw a raw TypeError instead of falling through to our
  // own "Avatar is required" check below.
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Step 5: upload from temp local storage to Cloudinary (permanent storage).
  // Files never go directly from the browser to Cloudinary - see
  // cloudinary.js for the full reasoning (credentials must stay
  // server-side, and we need to validate before anything gets
  // permanently stored).
  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
  const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

  // avatar MUST successfully upload - this is a required field
  if (!avatarResponse) {
    throw new ApiError(400, "Avatar upload failed, please try again");
  }

  // Step 6: create the user document in MongoDB
  // (password gets hashed automatically here via the pre("save") hook on the schema -
  // we intentionally pass the raw password, never hash it manually in the controller)
  const user = await User.create({
    username,
    email,
    fullname,
    avatar: avatarResponse.url,
    coverImage: coverImageResponse?.url || "", // optional - not every user needs one
    password,
  });

  // Step 7: fetch the freshly created user again, excluding sensitive fields.
  // .select("-password -refreshToken") tells Mongoose NOT to include these
  // fields in the returned document - this is what actually goes back in
  // the response. We re-fetch instead of just stripping fields off the
  // `user` object above because Mongoose documents carry internal
  // metadata/methods that we don't want leaking into the API response -
  // a fresh, selected query gives us a clean plain result.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Step 8: sanity check - if for some reason the user wasn't found right after creating it
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user"); // 500 --> server-side failure
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  // Login flow:
  // 1. Get username/email + password from frontend (or Postman)
  // 2. Require AT LEAST ONE of username/email to be present
  // 3. Look the user up in the DB by that identifier
  // 4. Verify the given password against the stored hashed password
  // 5. If valid, generate access + refresh tokens
  // 6. Send tokens back via secure httpOnly cookies (and in the JSON
  //    body too, for clients that can't use cookies - e.g. mobile apps)
  // 7. Respond with logged-in user info (sensitive fields stripped)

  const { username, email, password } = req.body;

  // A user should be able to log in with EITHER username OR email -
  // not both required. We use && here (not ||): we only throw if
  // BOTH are missing. If we used ||, a user providing just their
  // email (and no username) would incorrectly get rejected, even
  // though that's a perfectly valid way to log in.
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  // Both failure cases below - "no such user" and "wrong password" -
  // intentionally return the EXACT same status code (401) and the
  // exact same message. If "user not found" instead returned 404
  // while "wrong password" returned 401, an attacker probing random
  // usernames/emails could tell which ones exist in the system just
  // by reading the status code, even with an identical message shown
  // on-screen. Keeping status code AND message identical is what
  // actually prevents this kind of account enumeration.
  if (!user) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const isPasswordCorrect = await user.isValidPassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Re-fetch user post-token-generation, excluding sensitive fields -
  // this is what actually goes back in the response body.
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
        // Sending tokens in the body too (not just cookies) covers
        // clients that can't rely on cookies at all - e.g. native
        // mobile apps making raw API calls without a cookie jar.
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // This is the first controller where we actually need a custom
  // middleware, because unlike register/login, there's no req.body
  // with credentials here - there's no way to know WHICH user wants
  // to log out just from the request itself. So a custom middleware
  // (verifyJWT, in ../middlewares/authMiddleware.js) runs BEFORE this
  // controller, verifies the access token, and attaches the actual
  // user document as req.user.

  await User.findByIdAndUpdate(
    req.user._id,
    {
      // $unset removes the field entirely from the document.
      // Using $set: { refreshToken: undefined } instead would NOT
      // work here - MongoDB silently ignores "undefined" as a $set
      // value since it isn't a valid BSON type, so the old
      // refreshToken would stay in the DB completely unchanged,
      // which would defeat the entire purpose of logout (the old
      // refresh token would still be valid and usable against
      // /refresh-token afterward).
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true, // return the updated (post-unset) document
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Flow of renewing the access token using the refresh token:
  // 1. Get refresh token from cookies (or body, for non-cookie clients)
  // 2. Verify its signature is valid (not tampered/expired)
  // 3. Confirm it matches what's stored in the DB for this user
  //    (this is the revocation check - see token theory notes)
  // 4. If valid, issue a brand new token pair

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // jwt.verify does two things at once: checks the signature against
    // our secret (proving nobody tampered with the payload), and checks
    // the token hasn't expired. If either fails, it throws - which is
    // why this whole block is wrapped in try-catch.
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // This is the actual revocation check: does the incoming token
    // match what's CURRENTLY stored in the DB for this user? If the
    // user logged out ($unset'd their refreshToken) or a newer token
    // was already issued since this one was handed out, this old
    // token won't match anymore - even though its signature and
    // expiry are still technically valid. This is what makes
    // server-side session revocation possible at all with JWTs.
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or already used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(200, "Access token refreshed successfully", {
          accessToken,
          refreshToken: newRefreshToken,
        })
      );
  } catch (error) {
    console.log("Error: ", error);
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  // Change-password flow (protected route - depends on req.user from verifyJWT):
  // 1. Get old password, new password, and confirmation from the frontend
  // 2. Ensure all three fields are present
  // 3. Ensure newPassword and confirmPassword actually match
  // 4. Ensure newPassword meets the same strength requirements as registration
  // 5. Fetch the current user, verify oldPassword is actually correct
  // 6. If verified, assign the new password (hashing happens automatically
  //    via the pre("save") hook - we never hash manually here)

  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  // Enforcing the same strength bar as registration matters here -
  // otherwise a user could register with a strong password but then
  // downgrade to something weak through this endpoint, which would
  // make the registration-time validation pointless.
  if (!isStrongPassword(newPassword)) {
    throw new ApiError(
      400,
      "New password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    );
  }

  // req.user is populated by the verifyJWT middleware - this route
  // must be wired with verifyJWT in the routes file, or req.user will
  // be undefined and this line will throw.
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isValidPassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect");
  }

  // Just assign the plain new password here - the pre("save") hook
  // detects this.isModified("password") and hashes it automatically,
  // so manually hashing it in the controller would double-hash it
  // and break login afterward.
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // Simple protected route - verifyJWT already did the identity check
  // and attached req.user, so this just echoes it back. No DB call
  // needed here since req.user is already the freshly-fetched,
  // sensitive-fields-stripped user document from the middleware.
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched successfully", req.user));
});

const editAccountDetails = asyncHandler(async (req, res) => {
  // Update account flow:
  // 1. Get fullname/email from frontend
  // 2. Validate both are present and properly formatted
  // 3. Confirm the new email isn't already taken by a DIFFERENT user
  // 4. Update directly in DB via findByIdAndUpdate
  // 5. Return updated document (sensitive fields excluded)

  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!isValidFullname(fullname)) {
    throw new ApiError(400, "Fullname must be between 3 and 50 characters");
  }

  // The schema has `email: { unique: true }`, so MongoDB WILL reject
  // a duplicate at the database level - but that rejection comes back
  // as a raw MongoDB duplicate-key error, not one of our own ApiError
  // instances, which breaks the consistent error shape the rest of
  // the API relies on. Checking explicitly here lets us throw a
  // proper, predictable ApiError instead. The $ne (not-equal) on _id
  // excludes the current user themselves from the match - otherwise
  // a user re-submitting their OWN unchanged email would incorrectly
  // get flagged as a duplicate of themselves.
  const existingUser = await User.findOne({
    email,
    _id: { $ne: req.user._id },
  });

  if (existingUser) {
    throw new ApiError(409, "Email already in use by another account");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullname, email },
    },
    {
      new: true, // return the document AFTER the update, not before
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "Account details updated successfully", user));
});

const updateAvatar = asyncHandler(async (req, res) => {
  // Update avatar flow:
  // 1. Get avatar from frontend (req.file - single file upload via multer.single())
  // 2. Fetch the CURRENT user first, to know what the OLD avatar URL was
  //    (needed to delete it from Cloudinary later - once overwritten in
  //    the DB, we'd have no way to know what the old URL even was)
  // 3. Upload the new one to Cloudinary
  // 4. Update the DB record with the new URL
  // 5. Delete the OLD file from Cloudinary now that the new one is
  //    safely stored and the DB reference is updated
  // 6. Return updated document (sensitive fields excluded)

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Grab the old avatar URL BEFORE it gets overwritten in the DB
  const oldUserData = await User.findById(req.user?._id);
  const oldAvatarUrl = oldUserData?.avatar;

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");

  // Delete the OLD avatar from Cloudinary now that everything above
  // succeeded - only deleting AFTER a successful DB update means we
  // never end up with a user record pointing to a deleted file if
  // something above had failed instead.
  if (oldAvatarUrl) {
    await deleteFromCloudinary(oldAvatarUrl);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully", user));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  // Same pattern as updateAvatar above.

  const coverLocalPath = req.file?.path;

  if (!coverLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  const oldUserData = await User.findById(req.user?._id);
  const oldCoverImageUrl = oldUserData?.coverImage;

  const cover = await uploadOnCloudinary(coverLocalPath);

  if (!cover?.url) {
    throw new ApiError(400, "Cover image upload failed on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: cover.url } },
    { new: true }
  ).select("-password -refreshToken");

  if (oldCoverImageUrl) {
    await deleteFromCloudinary(oldCoverImageUrl);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Cover image updated successfully", user));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  updateAvatar,
  updateCoverImage,
  editAccountDetails,
};
