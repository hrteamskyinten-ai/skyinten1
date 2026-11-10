import express from "express";
import { allDetails, courseActive, courseDeactive, createCourse, isAdmin, updateCourse, deleteCourse, hackathonActive, hackathonDeactive, createHackathon, updateHackathon, deleteHackathon } from "../controllers/admin_controller.js";
import { allUsers, setUserVerification, allTutors, setTutorVerification, createTutor } from "../controllers/admin_controller.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import { uploadFiles } from "../middleware/multer.js";
import { setHackathonSchedule, setHackathonScheduleById, setSectionTimings, getSectionTimings, setLanguages, getLanguages } from "../controllers/hackathon_controller.js";

const adminRouter = express.Router();

adminRouter.get("/is/admin", userAuth, adminAuth, isAdmin);
adminRouter.get("/admin/allDetails", userAuth, adminAuth, allDetails)
adminRouter.post("/admin/course/active", userAuth, adminAuth, courseActive);
adminRouter.post("/admin/course/deactive", userAuth, adminAuth, courseDeactive);
adminRouter.post("/admin/course/create", userAuth, adminAuth, uploadFiles, createCourse)
adminRouter.post("/admin/course/update", userAuth, adminAuth, uploadFiles, updateCourse)
adminRouter.post("/admin/course/delete", userAuth, adminAuth, deleteCourse)
adminRouter.get('/admin/users', userAuth, adminAuth, allUsers);
adminRouter.get('/admin/tutors', userAuth, adminAuth, allTutors);
adminRouter.post('/admin/user/verify', userAuth, adminAuth, setUserVerification);
adminRouter.post('/admin/tutor/verify', userAuth, adminAuth, setTutorVerification);
adminRouter.post('/admin/tutor/create', userAuth, adminAuth, createTutor);
adminRouter.post('/admin/hackathon/schedule', userAuth, adminAuth, setHackathonSchedule);
adminRouter.post('/admin/hackathon/:id/schedule', userAuth, adminAuth, setHackathonScheduleById);
adminRouter.post('/admin/hackathon/:id/section-timings', userAuth, adminAuth, setSectionTimings);
adminRouter.get('/admin/hackathon/:id/section-timings', userAuth, adminAuth, getSectionTimings);
adminRouter.post('/admin/hackathon/:id/languages', userAuth, adminAuth, setLanguages);
adminRouter.get('/admin/hackathon/:id/languages', userAuth, adminAuth, getLanguages);
adminRouter.post('/admin/hackathon/active', userAuth, adminAuth, hackathonActive);
adminRouter.post('/admin/hackathon/deactive', userAuth, adminAuth, hackathonDeactive);
adminRouter.post('/admin/hackathon/create', userAuth, adminAuth, uploadFiles, createHackathon);
adminRouter.post('/admin/hackathon/update', userAuth, adminAuth, uploadFiles, updateHackathon);
adminRouter.post('/admin/hackathon/delete', userAuth, adminAuth, deleteHackathon);

export default adminRouter;