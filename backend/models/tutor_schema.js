import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const tutorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    resetOtp: {
        type: String,
        default: ""
    },
    resetOtpExpireAt: {
        type: Number,
        default: 0
    },
    assignedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],
    tutorMeets: [{
        meetId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: String,
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        },
        meetDate: {
            type: Date,
            required: true
        },
        meetTime: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['scheduled', 'live', 'completed'],
            default: 'scheduled'
        },
        duration: {
            type: Number, // in minutes
            default: 60
        },
        meetLink: String,
        students: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tutorVideos: [{
        videoId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: String,
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        },
        videoUrl: String,
        thumbnail: String,
        duration: {
            type: Number, // in seconds
            default: 0
        },
        views: {
            type: Number,
            default: 0
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    bio: String,
    qualification: String,
    profileImage: String,
    phone: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Method to compare passwords
tutorSchema.methods.comparePassword = async function(passwordToCheck) {
    return await bcrypt.compare(passwordToCheck, this.password);
};

const tutorModel = mongoose.model("Tutor", tutorSchema);
export default tutorModel;
