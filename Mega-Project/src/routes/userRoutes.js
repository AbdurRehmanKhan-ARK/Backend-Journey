import { Router } from "express";
import { registerUser } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
const router = Router();

router.route("/register").post(
    // middleware called for multer uploading the images to our server first 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
    ,registerUser); // Register a new user when POSTing to /register, similarly for login




export default router;
