import express from "express";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  addPaymentHistory,
  getAllPaymentHistory,
  getCoursePurchasingHistory,
  getHackathonPurchasingHistory,
  getCourseFeeSummary,
  getHackathonFeeSummary,
  getPaymentHistoryByEmail,
  deletePaymentHistory
} from "../controllers/payment_history_controller.js";

const paymentHistoryRouter = express.Router();

// Public routes - to fetch payment history
paymentHistoryRouter.get('/all', getAllPaymentHistory);
paymentHistoryRouter.get('/courses', getCoursePurchasingHistory);
paymentHistoryRouter.get('/hackathons', getHackathonPurchasingHistory);
paymentHistoryRouter.get('/courses/summary', getCourseFeeSummary);
paymentHistoryRouter.get('/hackathons/summary', getHackathonFeeSummary);
paymentHistoryRouter.get('/student/:email', getPaymentHistoryByEmail);

// Admin routes - to add and delete payment history
paymentHistoryRouter.post('/add', userAuth, adminAuth, addPaymentHistory);
paymentHistoryRouter.delete('/remove', userAuth, adminAuth, deletePaymentHistory);

export default paymentHistoryRouter;
