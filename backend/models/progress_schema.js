import mongoose from "mongoose";

const topicProgressSchema = new mongoose.Schema({
    topicId: {
        type: String,
        required: true
    },
    topicTitle: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    watchedPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    completedAt: {
        type: Date,
        default: null
    }
});

const moduleProgressSchema = new mongoose.Schema({
    moduleId: {
        type: String,
        required: true
    },
    moduleTitle: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: true
    },
    topics: [topicProgressSchema],
    assignmentCompleted: {
        type: Boolean,
        default: false
    },
    assignmentCompletedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
});

const courseProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    modules: [moduleProgressSchema],
    overallProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
});

const progressModel = mongoose.model("CourseProgress", courseProgressSchema);
export default progressModel;
