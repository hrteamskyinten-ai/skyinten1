import express from "express";
import { submitResult, getCorrectAnswers, getResults, completeHackathon, checkHackathonSubmitted } from "../controllers/result_controller.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/submitResult", userAuth, submitResult);
router.get("/hackathon/:hackathonId/correctAnswers", getCorrectAnswers);
router.get("/hackathon/results", userAuth, adminAuth, getResults);
router.post("/user/complete-hackathon", userAuth, completeHackathon);
router.get("/checkHackathonSubmitted/:hackathonId", userAuth, checkHackathonSubmitted);

export default router;
