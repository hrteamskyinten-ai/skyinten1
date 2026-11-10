import express from 'express';
import userAuth from '../middleware/userAuth.js';
import {
    initializeCourseProgress,
    getCourseProgress,
    updateTopicProgress,
    completeAssignment,
    markCourseCompleted
} from '../controllers/progress_controller.js';

const progressRouter = express.Router();

// All routes require user authentication
progressRouter.use(userAuth);

// Initialize course progress when user enrolls
progressRouter.post('/initialize', initializeCourseProgress);

// UPDATE TOPIC PROGRESS - Must come BEFORE dynamic :courseId route
progressRouter.put('/topic/update', updateTopicProgress);

// Mark assignment as completed
progressRouter.put('/assignment/complete', completeAssignment);

// Mark entire course as completed
progressRouter.put('/course/complete', markCourseCompleted);

// Get course progress for a specific course - Dynamic route LAST
progressRouter.get('/:courseId', getCourseProgress);

export default progressRouter;
