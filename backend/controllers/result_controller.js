import Result from "../models/result_schema.js";
import userModel from "../models/user_schema.js";
import Question from "../models/hackathon_question.js";
import hackathonModel from "../models/hackathon_schema.js";

// POST /api/submitResult
export const submitResult = async (req, res) => {
  console.log('submitResult called with userId:', req.body.userId);
  try {
    const { mcq, coding, finalScore, timestamp, hackathonId } = req.body;
    // userAuth middleware places userId in req.body
    const userId = req.body.userId || null;

    // Check if a score already exists for this user and hackathon
    if (userId && hackathonId) {
      const existingResult = await Result.findOne({
        userId: userId,
        hackathonId: hackathonId
      });

      if (existingResult) {
        // Update existing result with new score
        existingResult.mcq = {
          correct: mcq?.correct || 0,
          total: mcq?.total || 0,
        };
        existingResult.coding = {
          codingDoneCount: coding?.codingDoneCount || 0,
          passedTestcases: coding?.passedTestcases || 0,
          totalTestcases: coding?.totalTestcases || 0,
        };
        existingResult.finalScore = finalScore || 0;
        existingResult.timestamp = timestamp ? new Date(timestamp) : new Date();

        await existingResult.save();

        // Update user's completedHackathons with new score
        try {
          await userModel.findByIdAndUpdate(userId, {
            $pull: { completedHackathons: { hackathonId: hackathonId } }
          });
          await userModel.findByIdAndUpdate(userId, {
            $push: { completedHackathons: { hackathonId: hackathonId, score: finalScore } }
          });
        } catch (updateError) {
          console.error('Error updating user completedHackathons:', updateError);
        }

        return res.json({ 
          success: true, 
          message: "Result updated successfully", 
          result: existingResult,
          isUpdated: true 
        });
      }
    }

    // fetch user server-side to avoid trusting client-provided name
    let studentName = null;
    if (userId) {
      const u = await userModel.findById(userId).lean();
      studentName = u?.name || null;
    }

    // Fetch hackathon name if hackathonId provided
    let hackathonName = null;
    if (hackathonId) {
      const h = await hackathonModel.findById(hackathonId).lean();
      hackathonName = h?.name || null;
    }

    const newResult = new Result({
      userId: userId || null,
      studentName: studentName,
      hackathonId: hackathonId || null,
      hackathonName: hackathonName,
      mcq: {
        correct: mcq?.correct || 0,
        total: mcq?.total || 0,
      },
    coding: {
      codingDoneCount: coding?.codingDoneCount || 0,
      passedTestcases: coding?.passedTestcases || 0,
      totalTestcases: coding?.totalTestcases || 0,
    },
    finalScore: finalScore || 0,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  });

  await newResult.save();

  // Add to user's completedHackathons if not already present
  if (userId && hackathonId) {
    try {
      const updateResult = await userModel.findByIdAndUpdate(userId, {
        $addToSet: { completedHackathons: { hackathonId: hackathonId, score: finalScore } }
      });
      console.log('User updated successfully, result:', !!updateResult);
    } catch (updateError) {
      console.error('Error updating user completedHackathons:', updateError);
      // Don't fail the whole request if user update fails
    }
  }

  return res.json({ success: true, message: "Result saved", result: newResult });
} catch (error) {
  console.error(error);
  return res.status(500).json({ success: false, message: error.message });
}
};

// GET /api/hackathon/:hackathonId/correctAnswers
export const getCorrectAnswers = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    if (!hackathonId) {
      return res.status(400).json({ success: false, message: 'hackathonId is required' });
    }

    // Fetch hackathon and get its questions
    const hackathon = await hackathonModel.findById(hackathonId).populate('mcqs').lean();
    
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Extract correct answers from the hackathon's MCQs
    const correctAnswers = (hackathon.mcqs || []).map((q) => q.correctIndex);
    return res.json({ success: true, correctAnswers });
  } catch (error) {
    console.error('getCorrectAnswers error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getResults = async (req, res) => {
  try {
    // Pagination & filtering
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(5, parseInt(req.query.limit || '50'));
    const skip = (page - 1) * limit;

    const filter = {};
    
    // Filter by hackathonId if provided
    if (req.query.hackathonId) {
      filter.hackathonId = req.query.hackathonId;
    }
    
    if (req.query.search) {
      filter.$or = [
        { studentName: { $regex: req.query.search, $options: 'i' } },
        { hackathonName: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const results = await Result.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await Result.countDocuments(filter);
    return res.json({ success: true, results, page, limit, total });
  } catch (error) {
    console.error('getResults error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/complete-hackathon
export const completeHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.body;
    const userId = req.body.userId; // Set by userAuth middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: "hackathonId is required" });
    }

    // Find user and add hackathon to completedHackathons if not already there
    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { completedHackathons: { hackathonId: hackathonId, score: null } } // $addToSet prevents duplicates
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Hackathon marked as completed", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/checkHackathonSubmitted/:hackathonId
// Check if current user has already submitted results for a hackathon
export const checkHackathonSubmitted = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.body.userId; // Set by userAuth middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: "hackathonId is required" });
    }

    // Check if result exists for this user and hackathon
    const existingResult = await Result.findOne({
      userId: userId,
      hackathonId: hackathonId
    }).lean();

    if (existingResult) {
      return res.json({ 
        success: true, 
        submitted: true, 
        message: "Hackathon already submitted",
        result: existingResult
      });
    }

    return res.json({ 
      success: true, 
      submitted: false, 
      message: "Hackathon not yet submitted" 
    });
  } catch (error) {
    console.error('checkHackathonSubmitted error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

