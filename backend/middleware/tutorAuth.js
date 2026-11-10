import userModel from "../models/user_schema.js";

const tutorAuth = async (req, res, next) => {
    const userId = req.body?.userId || req.userId;

    console.log("TutorAuth - Checking user:", userId);

    try { 
        if (!userId) {
            console.error("TutorAuth - No userId found");
            return res.json({ success: false, message: "User ID not found. Please login again." });
        }

        const user = await userModel.findById(userId);

        console.log("TutorAuth - User lookup result:", user ? `Found user ${user._id}, role: ${user.role}` : "User not found");

        if (!user) {
            console.error("TutorAuth - User not found in database for userId:", userId);
            return res.json({ success: false, message: "User not found in database. Please login again." });
        }

        if (user.role === "tutor" || user.role === "admin") {
            console.log("TutorAuth - User is authorized as tutor/admin");
            next();
        } else {
            console.error("TutorAuth - User role is not tutor or admin, actual role:", user.role);
            return res.json({ success: false, message: `You are not authorized as a tutor. Your role is: ${user.role}. Only tutors and admins can perform this action.` });
        }
    }
    catch (error) {
        console.error("TutorAuth - Error:", error);
       return res.json({ success: false, message: error.message }); 
    }
}

export default tutorAuth;
