import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
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
        required: true,
    },
    verifyOtp: {
        type: String,
        default: ""
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0
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
    role: {
        type: String,
        default: "user"
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ]
    ,
    enrolledHackathons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hackathon"
        }
    ],
    completedCourses: [
        {
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            },
            completedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    completedHackathons: [
        {
            hackathonId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Hackathon"
            },
            score: {
                type: Number,
                default: 0
            }
        }
    ]
},
{
    timestamps: true,
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(passwordToCheck) {
    return await bcrypt.compare(passwordToCheck, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;