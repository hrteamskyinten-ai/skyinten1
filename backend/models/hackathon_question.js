import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String }],
  correctIndex: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false }
}, { timestamps: true });

const Question = mongoose.models.HackathonQuestion || mongoose.model('HackathonQuestion', questionSchema);
export default Question;
