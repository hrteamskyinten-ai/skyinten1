import express from "express";
import { isAuthenticated, login, logout, passResetOtp, passwordReset, register, sendOtp, verifyMail } from "../controllers/auth_controller.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register",register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/sendOtp",userAuth ,sendOtp);
authRouter.post("/verifyMail",userAuth,verifyMail);
authRouter.get("/is/auth", userAuth, isAuthenticated);
authRouter.post("/passResetOtp", passResetOtp);
authRouter.post("/passwordReset", passwordReset);


export default authRouter;