import express from "express";
import { getActiveCourses, getAllCourses, getSingleCourse, getTopCourses, getCourseByName, assignCourseToUsers, createModule, getCourseModules, updateModule, deleteModule, addTopicToModule, updateTopic, deleteTopic, updateModuleAssignment, getModuleAssignment, deleteModuleAssignment, getStudentAssignments, streamTopicVideo } from "../controllers/course_controller.js";
import userAuth from "../middleware/userAuth.js"
import adminAuth from "../middleware/adminAuth.js"
import { uploadFiles, uploadVideoFile } from "../middleware/multer.js";

const courseRouter = express.Router();

courseRouter.get("/courses/all", getAllCourses);
// register specific routes before parameter routes to avoid accidental matches
courseRouter.get("/courses/all/active", getActiveCourses);
courseRouter.get("/courses/top", getTopCourses);
courseRouter.get("/courses/name/:name", getCourseByName);
courseRouter.get("/courses/:id", getSingleCourse);
courseRouter.post('/courses/assign/students', userAuth, adminAuth, assignCourseToUsers);

// Module routes
courseRouter.post('/courses/:courseId/modules', userAuth, createModule);
courseRouter.get('/courses/:courseId/modules', userAuth, getCourseModules);
courseRouter.put('/courses/:courseId/modules/:moduleId', userAuth, updateModule);
courseRouter.delete('/courses/:courseId/modules/:moduleId', userAuth, deleteModule);

// Topic routes
// stream endpoint must come before parameterized topic routes to avoid slug conflicts
courseRouter.get('/courses/topics/:topicId/stream', userAuth, streamTopicVideo);
courseRouter.post('/courses/:courseId/modules/:moduleId/topics', userAuth, uploadVideoFile, addTopicToModule);
courseRouter.put('/courses/:courseId/modules/:moduleId/topics/:topicId', userAuth, uploadVideoFile, updateTopic);
courseRouter.delete('/courses/:courseId/modules/:moduleId/topics/:topicId', userAuth, deleteTopic);

// Assignment routes
courseRouter.put('/courses/:courseId/modules/:moduleId/assignment', userAuth, updateModuleAssignment);
courseRouter.get('/courses/:courseId/modules/:moduleId/assignment', userAuth, getModuleAssignment);
courseRouter.delete('/courses/:courseId/modules/:moduleId/assignment', userAuth, deleteModuleAssignment);

// Get all assignments for student's enrolled courses
courseRouter.get('/student/assignments', userAuth, getStudentAssignments);

export default courseRouter;