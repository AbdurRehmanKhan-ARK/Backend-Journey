import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/userController.js";

import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";


const router = Router();

router.route("/register").post(
  // middleware called for multer uploading the images to our server first
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
); // Register a new user when POSTing to /register, similarly for login

router.route("/login").post(loginUser);

// secured route
router.route("/logout").post(verifyJWT, logoutUser);
export default router;
