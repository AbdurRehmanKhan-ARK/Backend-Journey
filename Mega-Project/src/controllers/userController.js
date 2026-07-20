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

const generateAccessAndRefreshTokens = async(userId) => {
  try { 
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // save refresh token to DB
    user.refreshToken = refreshToken;
    user.save({validateBeforeSave: false}); // to skip validation of all fields of user schema just do this only, because by default save() will validate all fields 
  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens"); 
  }
}


const registerUser = asyncHandler(async (req, res) => {
  // TODO -> Registration flow:
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
  // TODO -> Logging flow:
  // 1. Get user details from frontend -> req.body (or Postman)
  // 2. Validate the user's username or email if not then you aren't a user (not registered yet) 
  // 3. Procedingly, now check if password is correct
  // 4. If password is correct then create a JWT token otherwise return error
  // 5. Generate access and refresh tokens and sent them to  user via secure cookies 
  // 6. Check if user successfully logged in, if yes then return response as "User logged in successfully"

  // STEP 1: Get user details from frontend 
  const {username,email,password} = req.body;
  
  // STEP 2: Validate the presence of user details (username or email) 
  // but actually at this step it should be finalized that which one to use as authentication, username or email BUT we are going with both for now
  if(!username || !email){
    throw new ApiError(400,"Username or email is required")
  }
  // Now if one of them is present correctly inside the db then proceed
  const user = await User.findOne({$or: [{username},{email}]});
  if(!user){
    throw new ApiError(404,"Invalid user credentials")
  }
  // we used 'Invalid user credentials' because we don't want hacker boy to know which one is wrong
  // STEP 3: Check if password is correct
  const isPasswordCorrect = await user.isValidPassword(password);
  if(!isPasswordCorrect){
    throw new ApiError(401, "Invalid user credentials");
  }

})
export { registerUser, loginUser };