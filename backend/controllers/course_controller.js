import courseModel from "../models/course_schema.js";
import userModel from "../models/user_schema.js";
import fs from "fs";
import path from "path";

export const getAllCourses = async (req,res) =>{

    try {
        const courses = await courseModel.find().populate('liveMeets.tutorId')
        // add enrolledCount to each course
        const coursesWithCount = await Promise.all(courses.map(async c => {
            const count = await userModel.countDocuments({ enrolledCourses: c._id });
            return { ...c.toObject(), enrolledCount: count };
        }));

        res.json({
            success: true,
            courses: coursesWithCount
        })  
    } 
    catch (error) {
        return res.json({success: false, message:error.message})
    }
}

export const getSingleCourse = async (req,res) =>{
    try {
        const course = await courseModel.findById(req.params.id).populate('liveMeets.tutorId');
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        const enrolledCount = await userModel.countDocuments({ enrolledCourses: course._id });
        res.json({
            course:{
                course: { ...course.toObject(), enrolledCount }
            }
        })
    }
    catch (error) {
        return res.json({success:false, message:error.message})
    }
}

export const getActiveCourses = async (req,res) =>{
    try{
        const courses = await courseModel.find({active:true}).populate('liveMeets.tutorId')
        const coursesWithCount = await Promise.all(courses.map(async c => {
            const count = await userModel.countDocuments({ enrolledCourses: c._id });
            return { ...c.toObject(), enrolledCount: count };
        }));

        return res.json({success:true,
            activeCourses:{
                courses: coursesWithCount
            }
        })
        
    }
    catch(error){
        return res.json({success: true, message:error.message});
    }
}

export const getCourseByName = async (req, res) => {
    try {
        const { name } = req.params;
        
        // Find course by exact name match (case-insensitive but preserves original case)
        const course = await courseModel.findOne({ name: name });
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        const enrolledCount = await userModel.countDocuments({ enrolledCourses: course._id });
        
        res.json({
            success: true,
            course: { ...course.toObject(), enrolledCount }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getTopCourses = async (req, res) => {
    try {
        const agg = await userModel.aggregate([
            { $unwind: "$enrolledCourses" },
            { $group: { _id: "$enrolledCourses", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "course",
                },
            },
            { $unwind: "$course" },
            {
                $project: {
                    _id: "$course._id",
                    name: "$course.name",
                    image: "$course.image",
                    price: "$course.price",
                    category: "$course.category",
                    enrolledCount: "$count",
                    reviews: "$course.reviews",
                },
            },
        ]);
        // If aggregation returns nothing (no enrollments yet), fall back to
        // returning the first 3 active courses so the frontend has items to show.
        if (!agg || agg.length === 0) {
            const fallback = await courseModel.find({ active: true }).limit(3).select('name image price category');
            const mapped = fallback.map(c => ({ _id: c._id, name: c.name, image: c.image, price: c.price, category: c.category, enrolledCount: 0 }));
            return res.json({ success: true, topCourses: mapped });
        }

        return res.json({ success: true, topCourses: agg });
    } catch (error) {
        console.error("getTopCourses error", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const assignCourseToUsers = async (req, res) => {
    try {
        const { emails, courseId } = req.body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ success: false, message: 'Emails array is required' });
        }

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }

        // Verify course exists
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

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
            if (user.enrolledCourses.includes(courseId)) {
                results.push({
                    email: trimmedEmail,
                    success: false,
                    message: 'Already enrolled'
                });
                continue;
            }

            // Add course to enrolled list
            user.enrolledCourses.push(courseId);
            await user.save();

            results.push({
                email: trimmedEmail,
                success: true,
                message: 'Course assigned successfully'
            });
        }

        return res.json({
            success: true,
            message: 'Course assignment complete',
            results
        });
    } catch (error) {
        console.error('assignCourseToUsers', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Module Management Functions
export const createModule = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const newModule = {
            title,
            description,
            order: course.modules.length,
            topics: [],
            assignment: { description: '', url: '' }
        };

        course.modules.push(newModule);
        await course.save();

        res.json({
            success: true,
            message: 'Module created successfully',
            module: course.modules[course.modules.length - 1]
        });
    } catch (error) {
        console.error('createModule error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCourseModules = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.json({
            success: true,
            modules: course.modules
        });
    } catch (error) {
        console.error('getCourseModules error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateModule = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { title, description } = req.body;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        if (title) module.title = title;
        if (description) module.description = description;

        await course.save();

        res.json({
            success: true,
            message: 'Module updated successfully',
            module
        });
    } catch (error) {
        console.error('updateModule error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteModule = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Get module before deleting to access its topics and their video files
        const module = course.modules.id(moduleId);
        if (module && module.topics) {
            // Delete all video files associated with topics in this module
            for (const topic of module.topics) {
                if (topic.videoFile) {
                    try {
                        const filePath = path.join(process.cwd(), topic.videoFile);
                        console.log('Attempting to delete file at:', filePath);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log('Deleted topic video file:', filePath);
                        } else {
                            console.warn('File not found:', filePath);
                        }
                    } catch (e) {
                        console.warn('Could not delete topic video file:', e.message);
                    }
                }
            }
        }

        course.modules.pull(moduleId);
        await course.save();

        res.json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        console.error('deleteModule error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Topic Management Functions
export const addTopicToModule = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { title, videoUrl } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        if (!req.file && !videoUrl) {
            return res.status(400).json({ success: false, message: 'Either video file or video URL is required' });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const newTopic = {
            title,
            videoUrl: videoUrl || "",
            videoFile: req.file ? `/uploads/videos/${req.file.filename}` : "",
            order: module.topics.length
        };

        module.topics.push(newTopic);
        await course.save();

        res.json({
            success: true,
            message: 'Topic added successfully',
            topic: module.topics[module.topics.length - 1]
        });
    } catch (error) {
        console.error('addTopicToModule error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTopic = async (req, res) => {
    try {
        const { courseId, moduleId, topicId } = req.params;
        const { title, videoUrl } = req.body;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const topic = module.topics.id(topicId);
        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        if (title) topic.title = title;
        if (videoUrl !== undefined) topic.videoUrl = videoUrl;
        if (req.file) {
            // Delete old video file if it exists
            if (topic.videoFile) {
                try {
                    const oldFilePath = path.join(process.cwd(), topic.videoFile);
                    console.log('Attempting to delete old file at:', oldFilePath);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                        console.log('Deleted old topic video file:', oldFilePath);
                    } else {
                        console.warn('Old file not found:', oldFilePath);
                    }
                } catch (e) {
                    console.warn('Could not delete old topic video file:', e.message);
                }
            }
            topic.videoFile = `/uploads/videos/${req.file.filename}`;
        }

        await course.save();

        res.json({
            success: true,
            message: 'Topic updated successfully',
            topic
        });
    } catch (error) {
        console.error('updateTopic error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTopic = async (req, res) => {
    try {
        const { courseId, moduleId, topicId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Get topic before deleting to access its video file
        const topic = module.topics.id(topicId);
        if (topic && topic.videoFile) {
            try {
                const filePath = path.join(process.cwd(), topic.videoFile);
                console.log('Attempting to delete file at:', filePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('Deleted topic video file:', filePath);
                } else {
                    console.warn('File not found:', filePath);
                }
            } catch (e) {
                console.warn('Could not delete topic video file:', e.message);
            }
        }

        module.topics.pull(topicId);
        await course.save();

        res.json({
            success: true,
            message: 'Topic deleted successfully'
        });
    } catch (error) {
        console.error('deleteTopic error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// stream the video file for a topic, verifying purchase
export const streamTopicVideo = async (req, res) => {
    try {
        const { topicId } = req.params;

        // find the course that contains this topic
        const course = await courseModel.findOne({ 'modules.topics._id': topicId });
        if (!course) {
            return res.sendStatus(404);
        }

        // verify user has purchased the course
        // userAuth provides req.userId; we need to load the full user record
        const User = (await import('../models/user_schema.js')).default;
        const user = await User.findById(req.userId).select('enrolledCourses');
        if (!user || !user.enrolledCourses || !user.enrolledCourses.includes(course._id)) {
            return res.sendStatus(403);
        }

        // locate the topic inside the modules
        let topic;
        for (const m of course.modules) {
            const found = m.topics.id(topicId);
            if (found) {
                topic = found;
                break;
            }
        }

        if (!topic || !topic.videoFile) {
            return res.sendStatus(404);
        }

        const filePath = path.join(process.cwd(), topic.videoFile);
        // express will set correct headers and stream the file
        return res.sendFile(filePath);
    } catch (err) {
        console.error('streamTopicVideo error:', err);
        return res.sendStatus(500);
    }
};

// Assignment Management Functions
export const updateModuleAssignment = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { description, url } = req.body;

        if (!description || !url) {
            return res.status(400).json({ success: false, message: 'Description and URL are required' });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        module.assignment = {
            description: description || '',
            url: url || '',
            createdAt: new Date()
        };

        await course.save();

        res.json({
            success: true,
            message: 'Assignment updated successfully',
            assignment: module.assignment
        });
    } catch (error) {
        console.error('updateModuleAssignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getModuleAssignment = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        res.json({
            success: true,
            assignment: module.assignment
        });
    } catch (error) {
        console.error('getModuleAssignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteModuleAssignment = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const module = course.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Clear the assignment
        module.assignment = { description: '', url: '' };
        await course.save();

        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        console.error('deleteModuleAssignment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all assignments from enrolled courses for a student
export const getStudentAssignments = async (req, res) => {
    try {
        const userId = req.userId;

        // Get the user with enrolled courses
        const user = await userModel.findById(userId).populate('enrolledCourses');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Collect all assignments from modules in enrolled courses
        const assignments = [];

        for (const course of user.enrolledCourses) {
            if (!course.modules) continue;

            course.modules.forEach((module) => {
                // Only include assignments that have content
                if (module.assignment && (module.assignment.description || module.assignment.url)) {
                    assignments.push({
                        _id: module._id,
                        courseId: course._id,
                        courseName: course.name,
                        moduleName: module.title,
                        moduleDescription: module.description,
                        assignment: {
                            description: module.assignment.description,
                            url: module.assignment.url,
                            createdAt: module.assignment.createdAt
                        }
                    });
                }
            });
        }

        // Sort by creation date (newest first)
        assignments.sort((a, b) => {
            const dateA = new Date(a.assignment.createdAt || 0);
            const dateB = new Date(b.assignment.createdAt || 0);
            return dateB - dateA;
        });

        res.json({
            success: true,
            assignments: assignments
        });
    } catch (error) {
        console.error('getStudentAssignments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};