import express from "express";
import { createQuestion, listQuestions, updateQuestion, deleteQuestion, getHackathonQuestions } from "../controllers/question_controller.js";
import { createCodingQuestion, listCodingQuestions, updateCodingQuestion, deleteCodingQuestion, getHackathonCodingQuestions } from "../controllers/coding_controller.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import { getHackathonSchedule, getHackathonScheduleById, setHackathonScheduleById, isHackathonAllowed, isHackathonAllowedById, getHackathonByName, getSectionTimings, getLanguages } from "../controllers/hackathon_controller.js";

import { getAllHackathons, getActiveHackathons, getInactiveHackathons, assignHackathonToUsers } from '../controllers/hackathon_controller.js';
const router = express.Router();

// Specific routes (literals) - must come before parameterized routes
router.get('/questions', listQuestions); // public list
router.get('/schedule', getHackathonSchedule);
router.get('/allowed', isHackathonAllowed);
router.get('/all', getAllHackathons);
router.get('/all/active', getActiveHackathons);
router.get('/all/inactive', getInactiveHackathons);
router.get('/name/:name', getHackathonByName);

// Parameterized routes - must come after specific routes
router.get('/:id/schedule', getHackathonScheduleById);
router.get('/:id/allowed', isHackathonAllowedById);
router.get('/:id/section-timings', getSectionTimings);
router.get('/:id/languages', getLanguages);
router.get('/:hackathonId/questions', getHackathonQuestions);
router.get('/:hackathonId/coding-questions', getHackathonCodingQuestions);

router.post('/questions', userAuth, adminAuth, createQuestion);
router.post('/:hackathonId/questions', userAuth, adminAuth, createQuestion);
router.post('/:hackathonId/coding-questions', userAuth, adminAuth, createCodingQuestion);
router.post('/assign/students', userAuth, adminAuth, assignHackathonToUsers);
router.put('/questions/:id', userAuth, adminAuth, updateQuestion);
router.put('/:hackathonId/questions/:id', userAuth, adminAuth, updateQuestion);
router.put('/:hackathonId/coding-questions/:id', userAuth, adminAuth, updateCodingQuestion);
router.delete('/questions/:id', userAuth, adminAuth, deleteQuestion);
router.delete('/:hackathonId/questions/:id', userAuth, adminAuth, deleteQuestion);
router.delete('/:hackathonId/coding-questions/:id', userAuth, adminAuth, deleteCodingQuestion);

export default router;
