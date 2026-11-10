import express from "express";
import { createCodeSubmission, getCodeStatus, judge0Health } from "../controllers/compiler_contoller.js";


const compilerRouter = express.Router();

compilerRouter.post("/compile", createCodeSubmission);
compilerRouter.get("/compile/status", getCodeStatus);
compilerRouter.get("/diagnostics/judge0", judge0Health);

export default compilerRouter;