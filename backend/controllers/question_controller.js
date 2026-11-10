import Question from "../models/hackathon_question.js";
import hackathonModel from "../models/hackathon_schema.js";

export const createQuestion = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { text, options, correctIndex } = req.body;
    const q = new Question({ text, options, correctIndex, createdBy: req.body.userId || null });
    await q.save();
    
    // Add question to hackathon if hackathonId provided
    if (hackathonId) {
      await hackathonModel.findByIdAndUpdate(hackathonId, { $push: { mcqs: q._id } }, { new: true });
    }
    
    return res.json({ success: true, question: q });
  } catch (err) {
    console.error('createQuestion error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const listQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}).lean();
    return res.json({ success: true, questions });
  } catch (err) {
    console.error('listQuestions error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getHackathonQuestions = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const hackathon = await hackathonModel.findById(hackathonId).populate('mcqs').lean();
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }
    return res.json({ success: true, questions: hackathon.mcqs || [] });
  } catch (err) {
    console.error('getHackathonQuestions error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const upd = await Question.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, question: upd });
  } catch (err) {
    console.error('updateQuestion error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id, hackathonId } = req.params;
    await Question.findByIdAndDelete(id);
    
    // Remove question from hackathon if hackathonId provided
    if (hackathonId) {
      await hackathonModel.findByIdAndUpdate(hackathonId, { $pull: { mcqs: id } }, { new: true });
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteQuestion error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
