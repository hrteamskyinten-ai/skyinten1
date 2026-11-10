import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData } from "../controllers/user_controller.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);

export default userRouter;