import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  editAccountDetails,
  updateAvatar,
  updateCoverImage,
  getWatchHistory,
} from "../controllers/userController.js";

import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

// PUBLIC ROUTES - no auth required, since these ARE the auth entry points
router.route("/register").post(
  // Multer must run BEFORE registerUser - it parses the multipart
  // form-data and places files into req.files, so the controller can
  // actually read req.files.avatar / req.files.coverImage.
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// refresh-token is intentionally public (no verifyJWT) - a user with
// an EXPIRED access token can't pass verifyJWT anyway. This route's
// whole job is to issue a new access token using the refresh token
// instead, which is verified manually inside the controller itself.
router.route("/refresh-token").post(refreshAccessToken);

// SECURED ROUTES - verifyJWT runs first on all of these, populating
// req.user before the actual controller executes. Without req.user,
// every one of these controllers would crash or behave incorrectly.

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

// PATCH (not POST/PUT) - semantically correct here since we're only
// partially updating the user document (fullname/email), not
// replacing the whole resource.
router.route("/update-account").patch(verifyJWT, editAccountDetails);

// upload.single("avatar") - only ONE file expected under this field
// name, unlike register's upload.fields() which handles two files at
// once. verifyJWT runs first, THEN multer, THEN the controller -
// order matters: we want to reject unauthenticated requests before
// even bothering to process an uploaded file.
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);

router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

// GET (read-only, nothing modified) - :username is a URL route
// parameter (accessed via req.params in the controller), not a query
// string or body field. verifyJWT is used here NOT to block
// unauthenticated access (isSubscribed uses req.user?._id with
// optional chaining, so it degrades gracefully to `false` for a
// logged-out visitor), but simply so req.user is available AT ALL for
// the isSubscribed check to work when someone IS logged in.
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);


// GET (not POST) - this only READS data, nothing is being created or
// modified. Uses an aggregation pipeline internally (see
// getWatchHistory in userController.js) to join watchHistory video
// IDs into full video documents, plus each video's owner info.
router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
