import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment_controller.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Create Razorpay order
router.post("/payment/order", createOrder);

// Verify payment signature (requires authenticated user)
router.post("/payment/verify", userAuth, verifyPayment);

export default router;
