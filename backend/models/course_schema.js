import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    duration:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    active:{
        type: Boolean,
        default: true
    },
    createdBy:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    enrollmentCount:{
        type: Number,
        default: 0
    },
    // Dynamic content fields for course details page
    subject:{
        type: String,
        default: ""
    },
    rating:{
        type: Number,
        default: 4.6,
        min: 0,
        max: 5
    },
    reviews:{
        type: Number,
        default: 100
    },
    approach:{
        type: String,
        default: ""
    },
    approachSubtitle:{
        type: String,
        default: ""
    },
    whatYouWillLearn:{
        type: [String],
        default: []
    },
    skillsYouWillGain:{
        type: [String],
        default: []
    },
    descriptionPoints:{
        type: [String],
        default: []
    },
    courseResources:[{
        resourceType:{
            type: String,
            enum: ['video', 'meet'],
            required: true
        },
        tutorId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tutor'
        },
        title:{
            type: String,
            required: true
        },
        description:{
            type: String
        },
        url:{
            type: String,
            required: true
        },
        uploadedDate:{
            type: Date,
            default: Date.now
        }
    }],
    modules: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        order: {
            type: Number,
            default: 0
        },
        topics: [{
            title: {
                type: String,
                required: true
            },
            videoUrl: {
                type: String,
                default: ""
            },
            videoFile: {
                type: String,
                default: ""
            },
            order: {
                type: Number,
                default: 0
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        assignment: {
            description: {
                type: String,
                default: ""
            },
            url: {
                type: String,
                default: ""
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    liveMeets: [{
        meetId: {
            type: String,
            required: true
        },
        tutorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tutor'
        },
        title: {
            type: String,
            required: true
        },
        meetLink: {
            type: String,
            required: true
        },
        meetTime: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['scheduled', 'live', 'completed'],
            default: 'scheduled'
        },
        description: {
            type: String,
            default: ""
        },
        duration: {
            type: Number,
            default: 60
        },
        students: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const courseModel = mongoose.model("Course", courseSchema);
export default courseModel;