import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expected: {
    type: String,
    required: true
  },
  sample: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const moduleCodingQuestionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  problemStatement: {
    type: String,
    default: ""
  },
  constraints: [{
    type: String
  }],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  language: {
    type: String,
    enum: ["python", "javascript", "java", "cpp", "c"],
    default: "python"
  },
  templateCode: {
    type: String,
    default: ""
  },
  testcases: [testCaseSchema],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  timeLimit: {
    type: Number,
    default: 5,
    description: "Time limit in seconds"
  },
  memoryLimit: {
    type: Number,
    default: 256,
    description: "Memory limit in MB"
  },
  hints: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create index for faster queries (slug already has unique index)
moduleCodingQuestionSchema.index({ courseId: 1, moduleId: 1 });

const ModuleCodingQuestion = mongoose.models.ModuleCodingQuestion || mongoose.model('ModuleCodingQuestion', moduleCodingQuestionSchema);
export default ModuleCodingQuestion;
