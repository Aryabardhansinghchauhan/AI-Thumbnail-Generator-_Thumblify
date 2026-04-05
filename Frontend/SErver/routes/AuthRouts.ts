import express from "express";
import { registerUser, loginUser, verifyUser, logoutUser } from "../Controller/AuthController.js";
import protect from "../middleware/auth.js";

const AuthRouter = express.Router();

AuthRouter.post('/register', registerUser);
AuthRouter.post('/login', loginUser);
AuthRouter.get('/verify', protect, verifyUser);
AuthRouter.post('/logout', protect, logoutUser);


export default AuthRouter;


