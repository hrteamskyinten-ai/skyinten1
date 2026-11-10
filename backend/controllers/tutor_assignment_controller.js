import TutorAssignmentModel from "../models/tutor_assignment_schema.js";
import tutorModel from "../models/tutor_schema.js";
import courseModel from "../models/course_schema.js";

// Get all tutors
export const getAllTutors = async (req, res) => {
    try {
        const tutors = await tutorModel.find().select("-password");
        if (tutors) {
            res.json({ success: true, tutors });
        } else {
            res.json({ success: false, message: "No tutors found" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Assign course to tutor
export const assignCourseToTutor = async (req, res) => {
    const { tutorId, courseId } = req.body;

    if (!tutorId || !courseId) {
        return res.json({ success: false, message: "Tutor and Course are required" });
    }

    try {
        // Check if tutor exists
        const tutor = await tutorModel.findById(tutorId);
        if (!tutor) {
            return res.json({ success: false, message: "Invalid tutor" });
        }

        // Check if course exists
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: "Invalid course" });
        }

        // Check if assignment already exists
        const existingAssignment = await TutorAssignmentModel.findOne({ tutor: tutorId, course: courseId });
        if (existingAssignment) {
            return res.json({ success: false, message: "This course is already assigned to this tutor" });
        }

        // Create new assignment
        const assignment = new TutorAssignmentModel({
            tutor: tutorId,
            course: courseId
        });

        await assignment.save();

        // Add course to tutor's assignedCourses array
        tutor.assignedCourses.push(courseId);
        await tutor.save();

        res.json({ success: true, message: "Course assigned to tutor successfully", assignment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get tutor's assigned courses
export const getTutorCourses = async (req, res) => {
    const { tutorId } = req.params;

    try {
        const assignments = await TutorAssignmentModel.find({ tutor: tutorId, status: "active" })
            .populate("course", "name description");

        if (assignments) {
            res.json({ success: true, assignments });
        } else {
            res.json({ success: false, message: "No assignments found" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Remove course assignment from tutor
export const removeCourseFromTutor = async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const assignment = await TutorAssignmentModel.findByIdAndUpdate(
            assignmentId,
            { status: "inactive" },
            { new: true }
        );

        if (assignment) {
            // Remove course from tutor's assignedCourses array
            await tutorModel.findByIdAndUpdate(
                assignment.tutor,
                { $pull: { assignedCourses: assignment.course } },
                { new: true }
            );

            res.json({ success: true, message: "Course removed from tutor", assignment });
        } else {
            res.json({ success: false, message: "Assignment not found" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all tutor assignments
export const getAllAssignments = async (req, res) => {
    try {
        const assignments = await TutorAssignmentModel.find({ status: "active" })
            .populate("tutor", "name email")
            .populate("course", "name description");

        if (assignments) {
            res.json({ success: true, assignments });
        } else {
            res.json({ success: false, message: "No assignments found" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
