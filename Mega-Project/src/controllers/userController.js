import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  isValidEmail,
  isValidUsername,
  isStrongPassword,
  isValidFullname,
} from "../utils/validators.js";
import jwt from "jsonwebtoken";

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

  // Step 3: check if user already exists - MUST await this, findOne() returns a Promise
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists"); // 409 --> conflict
  }

  // Step 4: Multer has already placed the files in a temp folder on our server.
  // req.files comes from multer's .fields() middleware - each field name maps
  // to an array of file objects (even if only one file is uploaded per field).
  // Optional chaining used at every level since these fields might not exist
  // if the user didn't attach a file at all.
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Step 5: upload from temp local storage to Cloudinary (permanent storage)
  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
  const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

  // avatar MUST successfully upload - this is a required field
  if (!avatarResponse) {
    throw new ApiError(400, "Avatar upload failed, please try again");
  }

  // Step 6: create the user document in MongoDB
  // (password gets hashed automatically here via the pre("save") hook on the schema)
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
  // fields in the returned document - this is what actually goes back in the response.
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

  // STEP 1: Get user details from frontend
  const { username, email, password } = req.body;

  // STEP 2: User should be able to log in with EITHER username OR
  // email - not both required. Using && here (not ||): we only throw
  // if BOTH are missing. If we used ||, a user providing just their
  // email (and no username) would incorrectly get rejected, even
  // though that's a perfectly valid way to log in.
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // STEP 3: find the user by whichever identifier was provided
  const user = await User.findOne({ $or: [{ username }, { email }] });

  // STEP 4: verify user exists AND password is correct.
  // IMPORTANT - both failure cases below use the SAME error message
  // AND the same status code (401). If "user not found" returned 404
  // while "wrong password" returned 401, an attacker could still tell
  // the two cases apart just by reading the status code, even with an
  // identical message - defeating the point of using one generic
  // message in the first place. Keeping status code AND message
  // identical is what actually prevents username/email enumeration.
  if (!user) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const isPasswordCorrect = await user.isValidPassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // STEP 5: generate a fresh token pair now that identity is confirmed
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Re-fetch user post-token-generation, excluding sensitive fields -
  // this is what actually goes back in the response body.
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // STEP 6: cookie options
  // httpOnly: true  --> JS on the frontend CANNOT read/modify this
  //                     cookie (document.cookie won't show it) - this
  //                     is what protects it from XSS-based token theft
  // secure: true    --> cookie is only sent over HTTPS, never plain HTTP
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
        // sending tokens in the body too (not just cookies) is a
        // common pattern - covers clients that can't rely on cookies
        // at all, e.g. native mobile apps making raw API calls
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // This is the point of code where we actually make our first user
  // defined middleware, because there's no other way to know WHICH
  // user wants to log out - unlike register/login, there's no
  // req.body with credentials here. So we made a custom middleware
  // in ../middlewares/authMiddleware.js (verifyJWT) that runs BEFORE
  // this controller, verifies the access token, and attaches the
  // actual user document as req.user.

  await User.findByIdAndUpdate(
    req.user._id,
    {
      // $unset REMOVES the field entirely from the document.
      // NOTE: $set: { refreshToken: undefined } does NOT work here -
      // MongoDB silently ignores "undefined" as a $set value since
      // it isn't a valid BSON type, so the old refreshToken would
      // stay in the DB unchanged - defeating the purpose of logout
      // (the old token would still be usable for /refresh-token).
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true, // return the updated (post-unset) document
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Flow of renewing the access token using the refresh token:
  // 1. Get refresh token from cookies (or body, for non-cookie clients)
  // 2. Verify its signature is valid (not tampered/expired)
  // 3. Confirm it matches what's stored in the DB for this user
  //    (this is the revocation check - see token theory notes)
  // 4. If valid, issue a brand new token pair

  // STEP 1: Get refresh token from frontend
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // STEP 2: verify signature + expiry of the incoming token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // STEP 3: does this token match what's currently stored in the DB?
    // If someone logged out (which $unset's refreshToken) or a newer
    // token was already issued, this old one won't match anymore.
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or already used");
    }

    // STEP 4: issue a fresh token pair
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
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

  // Keep the same strength bar as registration - otherwise a user could
  // register with a strong password but downgrade to a weak one here,
  // making the registration-time validation pointless.
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
  // detects this.isModified("password") and hashes it automatically.
  // validateBeforeSave: false skips full-schema re-validation (same
  // reasoning as in generateAccessAndRefreshTokens - we're only
  // touching one field, not resubmitting the whole document).
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

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
};
