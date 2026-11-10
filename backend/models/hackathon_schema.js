import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  image: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  category: { type: String, required: false },
  active: { type: Boolean, default: true },
  schedule: {
    startDatetime: { type: String, required: false },
    endDatetime: { type: String, required: false },
    startTime: { type: String, required: false },
    endTime: { type: String, required: false },
    timezone: { type: String, default: 'Asia/Kolkata' },
    // MCQ and Coding section timings (in minutes)
    mcqDuration: { type: Number, default: 15, required: false },
    codingDuration: { type: Number, default: 30, required: false }
  },
  // Supported languages for coding section
  languages: {
    type: [String],
    enum: ['Java', 'Python', 'C++', 'C', 'SQL', 'JavaScript'],
    default: ['Java', 'Python', 'C++', 'C', 'SQL', 'JavaScript'],
    required: false
  },
  mcqs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HackathonQuestion', required: false }],
  codingQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CodingQuestion', required: false }],
  createdBy: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  // Dynamic content fields for hackathon details page
  subtitle: {
    type: String,
    default: ""
  },
  about: {
    type: String,
    default: ""
  },
  whoCanParticipate: {
    type: [String],
    default: []
  },
  rewards: {
    type: [String],
    default: []
  }
});

const hackathonModel = mongoose.models.Hackathon || mongoose.model('Hackathon', hackathonSchema);
export default hackathonModel;
