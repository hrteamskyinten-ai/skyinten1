import express from "express";
import {
    getAllTutors,
    assignCourseToTutor,
    getTutorCourses,
    removeCourseFromTutor,
    getAllAssignments
} from "../controllers/tutor_assignment_controller.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Get all tutors
router.get("/tutors", userAuth, adminAuth, getAllTutors);

// Get all tutor assignments
router.get("/assignments", userAuth, adminAuth, getAllAssignments);

// Assign course to tutor
router.post("/assign-course", userAuth, adminAuth, assignCourseToTutor);

// Get tutor's assigned courses
router.get("/tutor/:tutorId/courses", userAuth, adminAuth, getTutorCourses);

// Remove course from tutor
router.put("/assignment/:assignmentId/remove", userAuth, adminAuth, removeCourseFromTutor);

export default router;
