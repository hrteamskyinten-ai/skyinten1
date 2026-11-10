import express from "express";
import {
    submitContactForm,
    getAllContacts,
    getContactById,
    markAsRead,
    markAsReplied,
    deleteContact,
    getContactsByStatus
} from "../controllers/contact_controller.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Public: Submit contact form
router.post("/contact/submit", submitContactForm);

// Admin: Get all contacts
router.get("/contact/all", userAuth, adminAuth, getAllContacts);

// Admin: Get contacts by status
router.get("/contact/status/:status", userAuth, adminAuth, getContactsByStatus);

// Admin: Get contact by ID
router.get("/contact/:id", userAuth, adminAuth, getContactById);

// Admin: Mark contact as read
router.put("/contact/:id/read", userAuth, adminAuth, markAsRead);

// Admin: Mark contact as replied
router.put("/contact/:id/replied", userAuth, adminAuth, markAsReplied);

// Admin: Delete contact
router.delete("/contact/:id", userAuth, adminAuth, deleteContact);

export default router;
