import settingModel from "../models/setting_schema.js";
import hackathonModel from "../models/hackathon_schema.js";

// Admin: set daily hackathon schedule (start and end in HH:MM, 24h)
export const setHackathonSchedule = async (req, res) => {
  try {
    const { startDatetime, endDatetime, startTime, endTime } = req.body;

    if (!startDatetime && !startTime) return res.status(400).json({ success: false, message: 'startDatetime or startTime required' });
    if (!endDatetime && !endTime) return res.status(400).json({ success: false, message: 'endDatetime or endTime required' });

    const key = 'hackathon_schedule';
    let value;
    if (startDatetime && endDatetime) {
      // expected ISO strings
      value = { startDatetime, endDatetime };
    } else {
      // legacy daily time window
      value = { startTime, endTime, timezone: 'Asia/Kolkata' };
    }

    await settingModel.findOneAndUpdate({ key }, { value, updatedAt: new Date() }, { upsert: true });
    return res.json({ success: true, message: 'Hackathon schedule saved', schedule: value });
  } catch (error) {
    console.error('setHackathonSchedule', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: return hackathon schedule
export const getHackathonSchedule = async (req, res) => {
  try {
    const key = 'hackathon_schedule';
    const doc = await settingModel.findOne({ key });
    if (!doc) return res.json({ success: true, schedule: null });
    return res.json({ success: true, schedule: doc.value });
  } catch (error) {
    console.error('getHackathonSchedule', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: check whether exam is allowed right now (server time)
export const isHackathonAllowed = async (req, res) => {
  try {
    const key = 'hackathon_schedule';
    const doc = await settingModel.findOne({ key });
    const now = new Date();

    if (!doc || !doc.value) return res.json({ success: true, allowed: false, schedule: null });

    const s = doc.value;
    let allowed = false;

    if (s.startDatetime && s.endDatetime) {
      const start = new Date(s.startDatetime);
      const end = new Date(s.endDatetime);
      allowed = now >= start && now <= end;
    } else if (s.startTime && s.endTime) {
      // interpret times as IST daily window
      const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const curMinutes = ist.getHours() * 60 + ist.getMinutes();
      const [sH, sM] = (s.startTime || '00:00').split(':').map(Number);
      const [eH, eM] = (s.endTime || '00:00').split(':').map(Number);
      const startMin = sH * 60 + sM;
      const endMin = eH * 60 + eM;
      if (startMin <= endMin) {
        allowed = curMinutes >= startMin && curMinutes <= endMin;
      } else {
        allowed = curMinutes >= startMin || curMinutes <= endMin;
      }
    }

    return res.json({ success: true, allowed, schedule: doc.value });
  } catch (error) {
    console.error('isHackathonAllowed', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: check whether specific hackathon exam is allowed right now (server time)
export const isHackathonAllowedById = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await hackathonModel.findById(id);
    const now = new Date();

    if (!hackathon) {
      return res.json({ success: true, allowed: false, schedule: null, error: 'Hackathon not found' });
    }
    
    if (!hackathon.schedule) {
      return res.json({ success: true, allowed: false, schedule: null, error: 'No schedule set' });
    }

    const s = hackathon.schedule;
    let allowed = false;

    if (s.startDatetime && s.endDatetime) {
      const start = new Date(s.startDatetime);
      const end = new Date(s.endDatetime);
      allowed = now >= start && now <= end;
    } else if (s.startTime && s.endTime) {
      // interpret times as IST daily window
      const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const curMinutes = istNow.getHours() * 60 + istNow.getMinutes();
      
      // Parse startTime and endTime safely
      const startTimeParts = (s.startTime || '00:00').toString().split(':');
      const endTimeParts = (s.endTime || '00:00').toString().split(':');
      
      const sH = parseInt(startTimeParts[0]) || 0;
      const sM = parseInt(startTimeParts[1]) || 0;
      const eH = parseInt(endTimeParts[0]) || 0;
      const eM = parseInt(endTimeParts[1]) || 0;
      
      const startMin = sH * 60 + sM;
      const endMin = eH * 60 + eM;
      
      if (startMin <= endMin) {
        allowed = curMinutes >= startMin && curMinutes <= endMin;
      } else {
        allowed = curMinutes >= startMin || curMinutes <= endMin;
      }
    } else {
      return res.json({ success: true, allowed: false, schedule: s, error: 'Schedule format invalid' });
    }

    return res.json({ success: true, allowed, schedule: s, curMinutes: Math.floor(Date.now() / 60000 % 1440), startMin: parseInt((s.startTime || '00:00').split(':')[0]) * 60 + parseInt((s.startTime || '00:00').split(':')[1]) });
  } catch (error) {
    console.error('isHackathonAllowedById', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: return all hackathons
export const getAllHackathons = async (req, res) => {
  try {
    const hacks = await hackathonModel.find();
    return res.json({ success: true, hackathons: hacks });
  } catch (error) {
    console.error('getAllHackathons', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: return active hackathons
export const getActiveHackathons = async (req, res) => {
  try {
    const hacks = await hackathonModel.find({ active: true });
    return res.json({ success: true, hackathons: hacks });
  } catch (error) {
    console.error('getActiveHackathons', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: get hackathon by name/slug
export const getHackathonByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    // Find hackathon by exact name match (exactly as stored in database)
    const hackathon = await hackathonModel.findOne({ name: name });
    
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }
    
    return res.json({ success: true, hackathon });
  } catch (error) {
    console.error('getHackathonByName', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get schedule for specific hackathon
export const getHackathonScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await hackathonModel.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }
    return res.json({ success: true, schedule: hackathon.schedule || null });
  } catch (error) {
    console.error('getHackathonScheduleById', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Set schedule for specific hackathon
export const setHackathonScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDatetime, endDatetime, startTime, endTime } = req.body;

    if (!startDatetime && !startTime) {
      return res.status(400).json({ success: false, message: 'startDatetime or startTime required' });
    }
    if (!endDatetime && !endTime) {
      return res.status(400).json({ success: false, message: 'endDatetime or endTime required' });
    }

    // Validate that both fields are filled if using time mode
    if ((startTime && !endTime) || (!startTime && endTime)) {
      return res.status(400).json({ success: false, message: 'Both start time and end time are required' });
    }

    const schedule = {};
    if (startDatetime && endDatetime) {
      // Validate datetime format
      const start = new Date(startDatetime);
      const end = new Date(endDatetime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid datetime format' });
      }
      
      if (start >= end) {
        return res.status(400).json({ success: false, message: 'Start time must be before end time' });
      }
      
      schedule.startDatetime = startDatetime;
      schedule.endDatetime = endDatetime;
    }
    if (startTime && endTime) {
      // Validate time format HH:MM
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return res.status(400).json({ success: false, message: 'Time must be in HH:MM format (24-hour)' });
      }
      
      schedule.startTime = startTime;
      schedule.endTime = endTime;
      schedule.timezone = 'Asia/Kolkata';
    }

    const hackathon = await hackathonModel.findByIdAndUpdate(
      id,
      { schedule },
      { new: true, runValidators: true }
    );

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    return res.json({ success: true, message: 'Hackathon schedule saved', schedule: hackathon.schedule });
  } catch (error) {
    console.error('setHackathonScheduleById', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: return inactive hackathons
export const getInactiveHackathons = async (req, res) => {
  try {
    const hacks = await hackathonModel.find({ active: false });
    return res.json({ success: true, hackathons: hacks });
  } catch (error) {
    console.error('getInactiveHackathons', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: set section timings (MCQ and Coding) for specific hackathon
export const setSectionTimings = async (req, res) => {
  try {
    const { id } = req.params;
    const { mcqDuration, codingDuration } = req.body;

    // Validate input
    if (!mcqDuration && mcqDuration !== 0) {
      return res.status(400).json({ success: false, message: 'MCQ duration is required' });
    }
    if (!codingDuration && codingDuration !== 0) {
      return res.status(400).json({ success: false, message: 'Coding duration is required' });
    }

    // Validate that durations are positive numbers
    if (typeof mcqDuration !== 'number' || mcqDuration < 0) {
      return res.status(400).json({ success: false, message: 'MCQ duration must be a positive number (in minutes)' });
    }
    if (typeof codingDuration !== 'number' || codingDuration < 0) {
      return res.status(400).json({ success: false, message: 'Coding duration must be a positive number (in minutes)' });
    }

    // Find hackathon and update schedule with new timings
    const hackathon = await hackathonModel.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Initialize schedule if it doesn't exist
    if (!hackathon.schedule) {
      hackathon.schedule = {};
    }

    // Update section timings
    hackathon.schedule.mcqDuration = mcqDuration;
    hackathon.schedule.codingDuration = codingDuration;

    await hackathon.save();

    return res.json({ 
      success: true, 
      message: 'Section timings updated successfully',
      schedule: hackathon.schedule 
    });
  } catch (error) {
    console.error('setSectionTimings', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: get section timings for specific hackathon
export const getSectionTimings = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await hackathonModel.findById(id);

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    const schedule = hackathon.schedule || {};
    return res.json({ 
      success: true, 
      timings: {
        mcqDuration: schedule.mcqDuration || 15,
        codingDuration: schedule.codingDuration || 30
      }
    });
  } catch (error) {
    console.error('getSectionTimings', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: set supported languages for hackathon
export const setLanguages = async (req, res) => {
  try {
    const { id } = req.params;
    const { languages } = req.body;

    // Validate languages array
    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({ success: false, message: 'Languages array is required and must not be empty' });
    }

    // Validate that each language is valid
    const validLanguages = ['Java', 'Python', 'C++', 'C', 'SQL', 'JavaScript'];
    for (const lang of languages) {
      if (!validLanguages.includes(lang)) {
        return res.status(400).json({ success: false, message: `Invalid language: ${lang}. Valid languages are: ${validLanguages.join(', ')}` });
      }
    }

    // Find hackathon and update languages
    const hackathon = await hackathonModel.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    hackathon.languages = languages;
    await hackathon.save();

    return res.json({ 
      success: true, 
      message: 'Languages updated successfully',
      languages: hackathon.languages 
    });
  } catch (error) {
    console.error('setLanguages', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Public: get supported languages for specific hackathon
export const getLanguages = async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await hackathonModel.findById(id);

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Return all languages if not set (backward compatibility)
    const languages = hackathon.languages || ['Java', 'Python', 'C++', 'C', 'SQL', 'JavaScript'];
    
    return res.json({ 
      success: true, 
      languages 
    });
  } catch (error) {
    console.error('getLanguages', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: assign hackathons to users by email
export const assignHackathonToUsers = async (req, res) => {
  try {
    const { emails, hackathonId } = req.body;


    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ success: false, message: 'Emails array is required' });
    }

    if (!hackathonId) {
      return res.status(400).json({ success: false, message: 'Hackathon ID is required' });
    }

    // Verify hackathon exists
    const hackathon = await hackathonModel.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Import userModel here to avoid circular dependency
    const userModel = (await import('../models/user_schema.js')).default;

    const results = [];
    for (const email of emails) {
      const trimmedEmail = email.trim().toLowerCase();
      
      // Find user by email
      const user = await userModel.findOne({ email: trimmedEmail });
      
      if (!user) {
        results.push({
          email: trimmedEmail,
          success: false,
          message: 'User not found'
        });
        continue;
      }

      // Check if already enrolled
      if (user.enrolledHackathons.includes(hackathonId)) {
        results.push({
          email: trimmedEmail,
          success: false,
          message: 'Already enrolled'
        });
        continue;
      }

      // Add hackathon to enrolled list
      user.enrolledHackathons.push(hackathonId);
      await user.save();

      results.push({
        email: trimmedEmail,
        success: true,
        message: 'Hackathon assigned successfully'
      });
    }

    return res.json({
      success: true,
      message: 'Hackathon assignment complete',
      results
    });
  } catch (error) {
    console.error('assignHackathonToUsers', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
