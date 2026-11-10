import Razorpay from "razorpay";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import userModel from "../models/user_schema.js";
import courseModel from "../models/course_schema.js";
import hackathonModel from "../models/hackathon_schema.js";
import paymentHistoryModel from "../models/payment_history_schema.js";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR (number)
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Number(amount) * 100, // convert to paise
      currency: "INR",
      // Razorpay receipt must be <= 40 chars. Use uuid without dashes (32 chars) plus prefix.
      receipt: `rcpt_${uuidv4().replace(/-/g, '')}`,
    };

    const order = await razorpayInstance.orders.create(options);

    return res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createOrder error", error);
    // If Razorpay returned a structured error, surface its description
    if (error && error.error && error.error.description) {
      return res.status(error.statusCode || 400).json({ message: error.error.description });
    }
    return res.status(500).json({ message: "Could not create order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseName } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment is verified. Persist purchase as needed.
      let enrolled = false;
      try {
        // `userAuth` middleware sets req.body.userId
        const userId = req.body.userId;
        console.log('verifyPayment called, userId:', userId, 'courseName:', courseName);
        if (!userId) {
          console.warn('verifyPayment: no authenticated userId found in request');
        } else if (!courseName) {
          console.warn('verifyPayment: no courseName provided');
        } else {
          // try course first
          const course = await courseModel.findOne({ name: courseName });
          const hack = !course ? await hackathonModel.findOne({ name: courseName }) : null;
          const user = await userModel.findById(userId);
          if (!user) {
            console.warn('verifyPayment: user not found id', userId);
          } else if (course) {
            const already = (user.enrolledCourses || []).some(c => String(c) === String(course._id));
            if (!already) {
              user.enrolledCourses = user.enrolledCourses || [];
              user.enrolledCourses.push(course._id);
              await user.save();
              enrolled = true;
              
              // Increment enrollment count for course
              course.enrollmentCount = (course.enrollmentCount || 0) + 1;
              await course.save();
              
              // Record payment history
              try {
                await paymentHistoryModel.create({
                  userId: userId,
                  studentName: user.name || 'Unknown',
                  studentEmail: user.email || 'Unknown',
                  itemType: 'course',
                  itemId: course._id,
                  itemName: course.name,
                  price: Number(course.price) || 0,
                  transactionStatus: 'completed',
                  purchasedAt: new Date()
                });
                console.log('Payment history recorded for course:', course.name);
              } catch (paymentHistoryError) {
                console.error('Error recording payment history:', paymentHistoryError);
              }
            } else {
              enrolled = true;
            }
            console.log('verifyPayment: course enrollment status for user', userId, enrolled);
          } else if (hack) {
            const already = (user.enrolledHackathons || []).some(h => String(h) === String(hack._id));
            if (!already) {
              user.enrolledHackathons = user.enrolledHackathons || [];
              user.enrolledHackathons.push(hack._id);
              await user.save();
              enrolled = true;
              
              // Increment enrollment count for hackathon
              hack.enrollmentCount = (hack.enrollmentCount || 0) + 1;
              await hack.save();
              
              // Record payment history
              try {
                await paymentHistoryModel.create({
                  userId: userId,
                  studentName: user.name || 'Unknown',
                  studentEmail: user.email || 'Unknown',
                  itemType: 'hackathon',
                  itemId: hack._id,
                  itemName: hack.name,
                  price: Number(hack.price) || 0,
                  transactionStatus: 'completed',
                  purchasedAt: new Date()
                });
                console.log('Payment history recorded for hackathon:', hack.name);
              } catch (paymentHistoryError) {
                console.error('Error recording payment history:', paymentHistoryError);
              }
            } else {
              enrolled = true;
            }
            console.log('verifyPayment: hackathon enrollment status for user', userId, enrolled);
          } else {
            console.warn('verifyPayment: no course or hackathon found for name', courseName);
          }
        }
      } catch (e) {
        console.error('verifyPayment enrollment error', e);
      }

      return res.json({ success: true, message: "Payment verified successfully", enrolled });
    }

    return res.status(400).json({ success: false, message: "Invalid signature" });
  } catch (error) {
    console.error("verifyPayment error", error);
    return res.status(500).json({ message: "Verification failed" });
  }
};
