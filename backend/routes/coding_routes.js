import express from "express";
import { listCodingQuestions } from "../controllers/coding_controller.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Keep backward compatibility with global coding questions list
router.get('/coding-questions', listCodingQuestions);

export default router;
