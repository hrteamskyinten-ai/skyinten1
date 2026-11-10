import CodingQuestion from "../models/coding_question.js";
import hackathonModel from "../models/hackathon_schema.js";

export const createCodingQuestion = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { title, description, language, templateCode, testcases } = req.body;
    const cq = new CodingQuestion({ title, description, language, templateCode, testcases, createdBy: req.body.userId || null });
    await cq.save();
    
    // Add coding question to hackathon if hackathonId provided
    if (hackathonId) {
      await hackathonModel.findByIdAndUpdate(hackathonId, { $push: { codingQuestions: cq._id } }, { new: true });
    }
    
    return res.json({ success: true, question: cq });
  } catch (err) {
    console.error('createCodingQuestion error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const listCodingQuestions = async (req, res) => {
  try {
    const questions = await CodingQuestion.find({}).lean();
    return res.json({ success: true, questions });
  } catch (err) {
    console.error('listCodingQuestions error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getHackathonCodingQuestions = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const hackathon = await hackathonModel.findById(hackathonId).populate('codingQuestions').lean();
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }
    return res.json({ success: true, codingQuestions: hackathon.codingQuestions || [] });
  } catch (err) {
    console.error('getHackathonCodingQuestions error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCodingQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const upd = await CodingQuestion.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, question: upd });
  } catch (err) {
    console.error('updateCodingQuestion error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCodingQuestion = async (req, res) => {
  try {
    const { id, hackathonId } = req.params;
    await CodingQuestion.findByIdAndDelete(id);
    
    // Remove coding question from hackathon if hackathonId provided
    if (hackathonId) {
      await hackathonModel.findByIdAndUpdate(hackathonId, { $pull: { codingQuestions: id } }, { new: true });
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteCodingQuestion error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
