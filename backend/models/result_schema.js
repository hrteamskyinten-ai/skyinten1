import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
  studentName: { type: String, default: null },
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: false },
  hackathonName: { type: String, default: null },
  mcq: {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  coding: {
    codingDoneCount: { type: Number, default: 0 },
    passedTestcases: { type: Number, default: 0 },
    totalTestcases: { type: Number, default: 0 },
  },
  finalScore: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const resultModel = mongoose.models.Result || mongoose.model("Result", resultSchema);
export default resultModel;
