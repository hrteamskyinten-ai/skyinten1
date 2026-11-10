import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true }
}, { _id: false });

const codingQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  templateCode: { type: String, default: '' },
  testcases: [testCaseSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false }
}, { timestamps: true });

const CodingQuestion = mongoose.models.CodingQuestion || mongoose.model('CodingQuestion', codingQuestionSchema);
export default CodingQuestion;
