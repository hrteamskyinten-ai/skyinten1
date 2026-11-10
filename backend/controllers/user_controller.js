import userModel from "../models/user_schema.js";
import tutorModel from "../models/tutor_schema.js";

export const getUserData = async (req,res) => {
    try {
        const userId = req.userId || req.body.userId;
        const userRole = req.userRole || req.body.userRole;

        let user;

        if(userRole === "tutor") {
            user = await tutorModel.findById(userId).populate('assignedCourses');
        } else {
            user = await userModel.findById(userId)
                .populate('enrolledCourses')
                .populate('enrolledHackathons')
                .populate('completedHackathons.hackathonId')
                .populate('completedCourses.courseId');
        }

        if(!user){
            return res.json({success:true, message: "User Not Found"});
        }

        if(userRole === "tutor") {
            res.json({
                success: true,
                userData:{
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    verifiedStatus: user.isAccountVerified,
                    role: "tutor",
                    assignedCourses: (user.assignedCourses || []).map(c => ({ _id: c._id, name: c.name, price: c.price, category: c.category, image: c.image, active: c.active, duration: c.duration })),
                    tutorMeets: user.tutorMeets || [],
                    tutorVideos: user.tutorVideos || []
                }
            });
        } else {
            res.json({
                success: true,
                userData:{
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    verifiedStatus: user.isAccountVerified,
                    role: user.role,
                    enrolledCourses: (user.enrolledCourses || []).map(c => ({ _id: c._id, name: c.name, price: c.price, category: c.category, image: c.image })),
                    completedCourses: (user.completedCourses || []).map(c => {
                        const course = c.courseId || {};
                        return { _id: course._id || c.courseId, name: course.name || '', price: course.price || null, category: course.category || null, image: course.image || null, completedAt: c.completedAt };
                    }),
                    enrolledHackathons: (user.enrolledHackathons || []).map(h => ({ _id: h._id, name: h.name, price: h.price, category: h.category, image: h.image })),
                    completedHackathons: (user.completedHackathons || []).map(h => {
                        if (h.hackathonId) {
                            return { hackathonId: h.hackathonId, score: h.score };
                        } else {
                            return { hackathonId: h, score: null };
                        }
                    })
                }
            });
        }

    } 
    catch (error) {
        return res.json({success:false, message:error.message});
    }

}