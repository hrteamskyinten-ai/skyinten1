import contactModel from "../models/contact_schema.js";

// User: Submit contact form
export const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Create new contact submission
        const contact = new contactModel({
            name,
            email,
            phone,
            message,
            status: "new"
        });

        // Save to database
        await contact.save();

        return res.status(201).json({
            success: true,
            message: "Your message has been sent successfully. We will get back to you soon!",
            contactId: contact._id
        });
    } catch (error) {
        console.error("submitContactForm error:", error);
        
        // Handle validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: messages
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to submit contact form. Please try again later."
        });
    }
};

// Admin: Get all contact submissions
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await contactModel.find().sort({ createdAt: -1 });

        return res.json({
            success: true,
            total: contacts.length,
            contacts
        });
    } catch (error) {
        console.error("getAllContacts error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch contacts"
        });
    }
};

// Admin: Get contact by ID
export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await contactModel.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        return res.json({
            success: true,
            contact
        });
    } catch (error) {
        console.error("getContactById error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch contact"
        });
    }
};

// Admin: Mark contact as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await contactModel.findByIdAndUpdate(
            id,
            { status: "read", updatedAt: Date.now() },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        return res.json({
            success: true,
            message: "Contact marked as read",
            contact
        });
    } catch (error) {
        console.error("markAsRead error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update contact"
        });
    }
};

// Admin: Mark contact as replied
export const markAsReplied = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await contactModel.findByIdAndUpdate(
            id,
            { status: "replied", updatedAt: Date.now() },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        return res.json({
            success: true,
            message: "Contact marked as replied",
            contact
        });
    } catch (error) {
        console.error("markAsReplied error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update contact"
        });
    }
};

// Admin: Delete contact
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await contactModel.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        return res.json({
            success: true,
            message: "Contact deleted successfully"
        });
    } catch (error) {
        console.error("deleteContact error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete contact"
        });
    }
};

// Admin: Get contacts by status
export const getContactsByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const validStatuses = ["new", "read", "replied"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: new, read, replied"
            });
        }

        const contacts = await contactModel.find({ status }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            status,
            total: contacts.length,
            contacts
        });
    } catch (error) {
        console.error("getContactsByStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch contacts"
        });
    }
};
