import express from "express";
import {
  createModuleMCQ,
  updateModuleMCQ,
  deleteModuleMCQ,
  getModuleMCQs,
  getModuleMCQBySlug,
  createModuleCodingQuestion,
  updateModuleCodingQuestion,
  deleteModuleCodingQuestion,
  getModuleCodingQuestions,
  getModuleCodingQuestionBySlug,
  submitAssignment
} from "../controllers/module_assignment_controller.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// ==================== MCQ ROUTES ====================

// Create MCQ (protected - user auth only)
router.post("/mcq/create", userAuth, createModuleMCQ);

// Get all MCQs for a module
router.get("/mcq/:courseId/:moduleId", getModuleMCQs);

// Get MCQ by slug
router.get("/mcq/slug/:slug", getModuleMCQBySlug);

// Update MCQ (protected - user auth only)
router.put("/mcq/:mcqId", userAuth, updateModuleMCQ);

// Delete MCQ (protected - user auth only)
router.delete("/mcq/:mcqId", userAuth, deleteModuleMCQ);

// ==================== CODING QUESTION ROUTES ====================

// Create coding question (protected - user auth only)
router.post("/coding/create", userAuth, createModuleCodingQuestion);

// Get all coding questions for a module
router.get("/coding/:courseId/:moduleId", getModuleCodingQuestions);

// Get coding question by slug
router.get("/coding/slug/:slug", getModuleCodingQuestionBySlug);

// Update coding question (protected - user auth only)
router.put("/coding/:questionId", userAuth, updateModuleCodingQuestion);

// Delete coding question (protected - user auth only)
router.delete("/coding/:questionId", userAuth, deleteModuleCodingQuestion);

// ==================== SUBMISSION ROUTES ====================

// Submit assignment (MCQ or Coding)
router.post("/submit", userAuth, submitAssignment);

export default router;
