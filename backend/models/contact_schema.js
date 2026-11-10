import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [50, "Name must not exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^[0-9]{10,}$/, "Please provide a valid phone number"]
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        minlength: [10, "Message must be at least 10 characters long"],
        maxlength: [5000, "Message must not exceed 5000 characters"]
    },
    status: {
        type: String,
        enum: ["new", "read", "replied"],
        default: "new"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
contactSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

const contactModel = mongoose.model("Contact", contactSchema);
export default contactModel;
