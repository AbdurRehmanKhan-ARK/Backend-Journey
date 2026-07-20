import { asyncHandler } from "../utils/asyncHandler.js"; 
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

// This is our first custom middleware - its ONLY job is to answer:
// "who is making this request?" by verifying the access token they
// sent, and attaching the actual user document to req.user so that
// every controller AFTER this middleware (like logoutUser) can just
// read req.user._id instead of re-verifying tokens themselves.

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Token can arrive two ways:
    // 1. As an httpOnly cookie (web browser clients - what we set
    //    during login via res.cookie("accessToken", ...))
    // 2. As an Authorization header (mobile apps / API clients that
    //    can't rely on cookies - standard "Bearer <token>" format)
    // req.cookies requires the cookie-parser middleware that is set up in app.js via app.use(cookieParser())
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify the token's signature + expiry using the SAME secret
    // that was used to sign it in generateAccessToken() (userModel.js).
    // If tampered with or expired, jwt.verify() throws - caught below.
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // decodedToken._id comes from whatever payload we signed into the
    // token during generateAccessToken() - fetch the actual user,
    // excluding sensitive fields as always.
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Attach the verified user to the request object - every route
    // handler that runs AFTER this middleware can now access
    // req.user directly, without re-verifying anything.
    req.user = user;

    next(); // hand off control to the next middleware/controller in the chain
  } catch (error) {
    // Covers both jwt.verify() failures (expired/tampered token) and
    // the manual ApiError throws above - normalized into one response.
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
