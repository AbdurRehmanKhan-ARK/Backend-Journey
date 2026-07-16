import {Router} from "express"
import {registerUser} from "../controllers/userController.js"
const router = Router();

router.route("/register").post(registerUser); // Register a new user when POSTing to /register, similarly for login
export default router