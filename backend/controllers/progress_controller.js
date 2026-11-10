import progressModel from '../models/progress_schema.js';
import courseModel from '../models/course_schema.js';
import userModel from '../models/user_schema.js';

// Initialize course progress for a user when they enroll
export const initializeCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.userId;

        console.log('\ud83d\udd04 INITIALIZE PROGRESS - userId:', userId, 'courseId:', courseId);

        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }

        if (!userId) {
            console.error('\u274c userId is undefined - auth middleware may not be working');
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Check if the user already has progress tracked for this course
        let courseProgress = await progressModel.findOne({ userId, courseId });

        if (courseProgress) {
            return res.status(200).json({ success: true, message: 'Progress already initialized', courseProgress });
        }

        // Get course data to create initial progress structure
        const course = await courseModel.findById(courseId);
        if (!course) {
            console.error('\u274c Course not found with ID:', courseId);
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        console.log('\u2705 Course found:', course.name, 'modules count:', course.modules.length);

        // Initialize progress for all modules
        const modules = course.modules.map((module, index) => ({
            moduleId: module._id.toString(),
            moduleTitle: module.title,
            isCompleted: false,
            isLocked: index > 0, // First module is unlocked, rest are locked
            topics: (module.topics || []).map(topic => ({
                topicId: topic._id.toString(),
                topicTitle: topic.title,
                isCompleted: false,
                watchedPercentage: 0,
                completedAt: null
            })),
            assignmentCompleted: false,
            assignmentCompletedAt: null,
            completedAt: null
        }));
        courseProgress = new progressModel({
            userId,
            courseId,
            modules,
            overallProgress: 0
        });

        await courseProgress.save();

        res.status(201).json({
            success: true,
            message: 'Course progress initialized',
            courseProgress
        });
    } catch (error) {
        console.error('Error initializing course progress:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get course progress for a user
export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.userId;

        const courseProgress = await progressModel.findOne({ userId, courseId });

        if (!courseProgress) {
            return res.status(404).json({ success: false, message: 'Progress not found. Initialize first.' });
        }

        res.status(200).json({ success: true, courseProgress });
    } catch (error) {
        console.error('Error getting course progress:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update topic watch progress
export const updateTopicProgress = async (req, res) => {
    try {
        const { courseId, moduleId, topicId, watchedPercentage } = req.body;
        const userId = req.userId;

        console.log('📝 UPDATE TOPIC PROGRESS:', { userId, courseId, moduleId, topicId, watchedPercentage });

        if (!courseId || !moduleId || !topicId || watchedPercentage === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'courseId, moduleId, topicId, and watchedPercentage are required' 
            });
        }

        let courseProgress = await progressModel.findOne({ userId, courseId });
        if (!courseProgress) {
            console.log('❌ Progress not found for userId:', userId, 'courseId:', courseId);
            return res.status(404).json({ success: false, message: 'Progress not found' });
        }

        console.log('✅ Found courseProgress, modules count:', courseProgress.modules.length);

        // Use array index to find and update nested fields
        const moduleIndex = courseProgress.modules.findIndex(m => m.moduleId === moduleId);
        if (moduleIndex === -1) {
            console.log('❌ Module not found. Available modules:', courseProgress.modules.map(m => m.moduleId));
            return res.status(404).json({ success: false, message: 'Module not found in progress' });
        }

        const topicIndex = courseProgress.modules[moduleIndex].topics.findIndex(t => t.topicId === topicId);
        if (topicIndex === -1) {
            console.log('❌ Topic not found in module. Available topics:', courseProgress.modules[moduleIndex].topics.map(t => t.topicId));
            return res.status(404).json({ success: false, message: 'Topic not found in module' });
        }

        const topic = courseProgress.modules[moduleIndex].topics[topicIndex];
        topic.watchedPercentage = Math.min(watchedPercentage, 100);
        console.log(`📊 Updated topic watchedPercentage: ${topic.watchedPercentage}%`);

        // If watched 90% or more, mark as completed
        if (watchedPercentage >= 90 && !topic.isCompleted) {
            topic.isCompleted = true;
            topic.completedAt = new Date();
        }

        // Check if all topics in the module are completed
        const module = courseProgress.modules[moduleIndex];
        const allTopicsCompleted = module.topics.every(t => t.isCompleted);

        // If all topics are completed but assignment exists and not completed, keep module locked
        const course = await courseModel.findById(courseId);
        const moduleData = course.modules.find(m => m._id.toString() === moduleId);
        const hasAssignment = moduleData && moduleData.assignment && moduleData.assignment.description;

        if (allTopicsCompleted && (!hasAssignment || module.assignmentCompleted)) {
            module.isCompleted = true;
            module.completedAt = new Date();

            // Unlock next module
            const nextModuleIndex = courseProgress.modules.findIndex(m => m.moduleId === moduleId) + 1;
            if (nextModuleIndex < courseProgress.modules.length) {
                courseProgress.modules[nextModuleIndex].isLocked = false;
            }
        }

        // Calculate overall progress (including both topics AND assignments)
        let totalItems = 0;
        let completedItems = 0;

        courseProgress.modules.forEach(m => {
          // Count topics
          totalItems += m.topics.length;
          completedItems += m.topics.filter(t => t.isCompleted).length;
          
          // Count assignment if module has one
          const moduleData = course.modules.find(mod => mod._id.toString() === m.moduleId);
          if (moduleData && moduleData.assignment && moduleData.assignment.description) {
            totalItems += 1; // Add 1 for the assignment
            if (m.assignmentCompleted) {
              completedItems += 1; // Count assignment if completed
            }
          }
        });

        courseProgress.overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        console.log(`📊 Overall progress: ${completedItems}/${totalItems} = ${courseProgress.overallProgress}%`);

        // Check if course is completed
        if (courseProgress.modules.every(m => m.isCompleted)) {
            courseProgress.isCompleted = true;
            courseProgress.completedAt = new Date();
        }

        courseProgress.lastAccessedAt = new Date();
        await courseProgress.save();

        // If course completed, ensure it's in user's completedCourses
        if (courseProgress.isCompleted) {
            try {
                const user = await userModel.findById(userId);
                if (user) {
                    const alreadyCompleted = user.completedCourses && user.completedCourses.some(c => c.courseId.toString() === courseId);
                    if (!alreadyCompleted) {
                        user.completedCourses = user.completedCourses || [];
                        user.completedCourses.push({ courseId, completedAt: new Date() });
                        await user.save();
                        console.log('✅ Auto-added completed course to user profile');
                    }
                }
            } catch (err) {
                console.error('Error auto-updating user completedCourses:', err);
            }
        }

        res.status(200).json({ success: true, message: 'Topic progress updated', courseProgress });
    } catch (error) {
        console.error('Error updating topic progress:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Mark assignment as completed
export const completeAssignment = async (req, res) => {
    try {
        const { courseId, moduleId } = req.body;
        const userId = req.userId;

        if (!courseId || !moduleId) {
            return res.status(400).json({ success: false, message: 'courseId and moduleId are required' });
        }

        let courseProgress = await progressModel.findOne({ userId, courseId });
        if (!courseProgress) {
            return res.status(404).json({ success: false, message: 'Progress not found' });
        }

        const module = courseProgress.modules.find(m => m.moduleId === moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Check if all topics are completed
        const allTopicsCompleted = module.topics.every(t => t.isCompleted);
        if (!allTopicsCompleted) {
            return res.status(400).json({ 
                success: false, 
                message: 'Complete all topics before completing assignment' 
            });
        }

        module.assignmentCompleted = true;
        module.assignmentCompletedAt = new Date();
        module.isCompleted = true;
        module.completedAt = new Date();

        // Unlock next module
        const nextModuleIndex = courseProgress.modules.findIndex(m => m.moduleId === moduleId) + 1;
        if (nextModuleIndex < courseProgress.modules.length) {
            courseProgress.modules[nextModuleIndex].isLocked = false;
        }

        // Calculate overall progress (including both topics AND assignments)
        let totalItems = 0;
        let completedItems = 0;

        courseProgress.modules.forEach(m => {
          // Count topics
          totalItems += m.topics.length;
          completedItems += m.topics.filter(t => t.isCompleted).length;
          
          // Count assignment if module has one
          const moduleData = course.modules.find(mod => mod._id.toString() === m.moduleId);
          if (moduleData && moduleData.assignment && moduleData.assignment.description) {
            totalItems += 1; // Add 1 for the assignment
            if (m.assignmentCompleted) {
              completedItems += 1; // Count assignment if completed
            }
          }
        });

        courseProgress.overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        console.log(`📊 Overall progress: ${completedItems}/${totalItems} = ${courseProgress.overallProgress}%`);

        // Check if course is completed
        if (courseProgress.modules.every(m => m.isCompleted)) {
            courseProgress.isCompleted = true;
            courseProgress.completedAt = new Date();
        }

        courseProgress.lastAccessedAt = new Date();
        await courseProgress.save();

        res.status(200).json({ success: true, message: 'Assignment completed', courseProgress });
    } catch (error) {
        console.error('Error completing assignment:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


// Add completed course to user's profile
export const markCourseCompleted = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.userId;

        console.log('📝 MARK COURSE COMPLETED: userId:', userId, 'courseId:', courseId);

        const courseProgress = await progressModel.findOne({ userId, courseId });
        if (!courseProgress) {
            return res.status(404).json({ success: false, message: 'Progress not found' });
        }

        if (!courseProgress.isCompleted) {
            return res.status(400).json({ success: false, message: 'Course not fully completed' });
        }

        // Add course to user's completedCourses array
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if course already in completedCourses
        const alreadyCompleted = user.completedCourses && user.completedCourses.some(c => c.courseId.toString() === courseId);
        if (!alreadyCompleted) {
            if (!user.completedCourses) {
                user.completedCourses = [];
            }
            user.completedCourses.push({
                courseId,
                completedAt: new Date()
            });
            console.log('✅ Added course to user completedCourses');
        } else {
            console.log('ℹ️ Course already in user completedCourses');
        }

        await user.save();

        res.status(200).json({ success: true, message: 'Course marked as completed and added to user profile', courseProgress });
    } catch (error) {
        console.error('Error marking course completed:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
