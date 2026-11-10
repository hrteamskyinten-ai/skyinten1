import courseModel from "../models/course_schema.js";
import hackathonModel from "../models/hackathon_schema.js";
import userModel from "../models/user_schema.js";
import tutorModel from "../models/tutor_schema.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";


export const isAdmin = async (req,res) =>{
    try {
        return res.json({success: true})
    } 
    catch (error) {
        return res.json({success:false, message:error.message})    
    }
}

export const createCourse = async(req,res) =>{
    try {

        const {
            name, description, price, duration, category, createdBy,
            subject, rating, reviews, approach, approachSubtitle,
            whatYouWillLearn, skillsYouWillGain, descriptionPoints
        } = req.body;
        const image = req.file;

        if(!name || !description || !price || !duration || !category || !createdBy || !image){
            return res.json({success:false, message: "Please Fill The Required Details"})
        }

        // Parse array fields if they're strings
        const parseArrayField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field.filter(item => item.trim());
            return field.split('\n').map(item => item.trim()).filter(item => item);
        };

        await courseModel.create({
            name,
            description,
            category,
            createdBy,
            image: image?.path,
            duration,
            price,
            subject: subject || "",
            rating: rating ? parseFloat(rating) : 4.6,
            reviews: reviews ? parseInt(reviews) : 100,
            approach: approach || "",
            approachSubtitle: approachSubtitle || "",
            whatYouWillLearn: parseArrayField(whatYouWillLearn),
            skillsYouWillGain: parseArrayField(skillsYouWillGain),
            descriptionPoints: parseArrayField(descriptionPoints)
        });

        return res.json({success: true, message: "Course Created Successfully"})

    } 
    catch (error) {
        return res.json({success:false, message:error.message});
    }
}

export const allDetails = async (req,res) =>{
    try {

        // cutoff: users created in the last 24 hours
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 1);

        const usersCount = await userModel.countDocuments({ role: "user" });
        const coursesCount = await courseModel.countDocuments({});
        const hackathonsCount = await hackathonModel.countDocuments({});
        const newUsers = await userModel.countDocuments({ role: "user", createdAt: { $gte: cutoffDate } });

//         // 1. Define the cutoff date (e.g., 24 hours ago)
// var cutoffDate = new Date();
// cutoffDate.setDate(cutoffDate.getDate() - 1); // Set the date to 24 hours ago

// // 2. Convert the cutoff date to an ObjectId (optional, can directly use ISODate)
// // MongoDB ObjectId includes a timestamp, so you can compare ObjectIds directly
// // The above Date object can be used directly in the $match stage.

// // 3. The aggregation pipeline
// use admin;
// db.system.users.aggregate([
//   // Match documents where the user has the 'admin' role
//   {
//     $match: {
//       "roles.role": "admin"
//     }
//   },
//   // Further filter documents where the _id (creation time) is greater than or equal to the cutoff date
//   {
//     $match: {
//       _id: {
//         $gte: cutoffDate
//       }
//     }
//   },
//   // Count the remaining documents
//   {
//     $count: "newlyAddedAdminsCount"
//   }
// ]);


        const activeCourses = await courseModel.find({active: true})
        const nonActiveCourses = await courseModel.find({active: false})
        const activeHackathons = await hackathonModel.find({active: true})
        const nonActiveHackathons = await hackathonModel.find({active: false})
        const verifiedUsers = await userModel.find({ isAccountVerified: true }, { name: 1 })
        const unVerfiedUsers = await userModel.find({ isAccountVerified: false }, { name: 1 })
        // include enrolledCourses and timestamps so frontend can compute recent enrollments
        const allUsers = await userModel.find({}).select('-password').populate('enrolledCourses');
        const allCourses = await courseModel.find()
        const allHackathons = await hackathonModel.find()
        const userRoles = await userModel.find({}, {name:1, role:1})

        

        return res.json({success: true,
            adminData: {
                number_of_users: usersCount,
                number_of_courses: coursesCount,
                number_of_new_users: newUsers,
                active_courses: activeCourses,
                non_active_courses: nonActiveCourses,
                active_hackathons: activeHackathons,
                non_active_hackathons: nonActiveHackathons,
                verified_users: verifiedUsers,
                un_verified_users: unVerfiedUsers,
                all_users: allUsers,
                all_courses: allCourses,
                number_of_hackathons: hackathonsCount,
                all_hackathons: allHackathons,
                user_roles: userRoles
            }
        })

    } 
    catch (error) {
        return res.json({success:true, message: error.message});
    }
}

export const courseActive = async (req,res) =>{
    try {
        const {name} = req.body;
        if(!name){
            return res.json({success:false, message: "Enter The Course Name "})
        }

        const course = await courseModel.findOne({name});


        if(!course){
            return res.json({success:false, message: "No such Course"})
        }

        if(course.active === true){
            return res.json({success: true, message: "Course is Already in Active State"})
        }
        else{
            course.active = true
            await course.save();
        }

        return res.json({success: true, message: `${name} Course is Now Activated`})

    } 
    catch (error) {
        return res.json({success:true, message:error.message})    
    }
}


export const courseDeactive = async (req,res) =>{
    try {
        const {name} = req.body;
        if(!name){
            return res.json({success:false, message: "Enter The Course Name "})
        }
        
        const course = await courseModel.findOne({name});

        if(!course){
            return res.json({success:false, message: "No such Course"})
        }

        if(course.active === false){
            return res.json({success: true, message: "Course is Already in Deactive State"})
        }
        else{
            course.active = false
            await course.save();
        }

        return res.json({success: true, message: `${name} Course is Now Deactivated`})

    } 
    catch (error) {
        return res.json({success:true, message:error.message})    
    }
}

export const allUsers = async (req, res) => {
    try {
        // Return full user documents for admin review (limit fields as needed)
        // Populate enrolledCourses and enrolledHackathons so frontend can display names
        // Only students (role: 'user'), NOT tutors
        const users = await userModel.find({ role: 'user' }).select('-password')
            .populate('enrolledCourses')
            .populate('enrolledHackathons');
        return res.json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const allTutors = async (req, res) => {
    try {
        // Return all tutor documents
        const tutors = await tutorModel.find().select('-password')
            .populate('assignedCourses');
        return res.json({ success: true, tutors });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const setUserVerification = async (req, res) => {
    try {
        // `userAuth` middleware puts the admin's id into req.body.userId.
        // The target user id must come from a different property sent by the client.
        const adminId = req.body.userId;
        const targetUserId = req.body.targetUserId;
        const { verified } = req.body;

        if (!adminId) return res.status(401).json({ success: false, message: 'Not authorized' });
        if (!targetUserId || typeof verified === 'undefined') {
            return res.status(400).json({ success: false, message: 'targetUserId and verified are required' });
        }

        const user = await userModel.findById(targetUserId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isAccountVerified = !!verified;
        await user.save();

        return res.json({ success: true, message: `User verification set to ${user.isAccountVerified}`, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const setTutorVerification = async (req, res) => {
    try {
        const adminId = req.body.userId;
        const targetTutorId = req.body.targetTutorId;
        const { verified } = req.body;

        if (!adminId) return res.status(401).json({ success: false, message: 'Not authorized' });
        if (!targetTutorId || typeof verified === 'undefined') {
            return res.status(400).json({ success: false, message: 'targetTutorId and verified are required' });
        }

        const tutor = await tutorModel.findById(targetTutorId);
        if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });

        tutor.isAccountVerified = !!verified;
        await tutor.save();

        return res.json({ success: true, message: `Tutor verification set to ${tutor.isAccountVerified}`, tutor });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

    export const createTutor = async (req, res) => {
        try {
            const { name, email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            const exists = await tutorModel.findOne({ email });
            if (exists) return res.status(400).json({ success: false, message: 'Tutor with this email already exists' });

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            const tutor = await tutorModel.create({
                name: name || '',
                email,
                password: hashed,
                isAccountVerified: true
            });

            return res.json({ success: true, message: 'Tutor created successfully', tutor: { _id: tutor._id, name: tutor.name, email: tutor.email } });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

export const updateCourse = async (req, res) => {
    try {
        const { 
            id, name, description, price, duration, category,
            subject, rating, reviews, approach, approachSubtitle,
            whatYouWillLearn, skillsYouWillGain, descriptionPoints
        } = req.body;
        const image = req.file;

        if (!id) return res.status(400).json({ success: false, message: 'Course id is required' });

        const course = await courseModel.findById(id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        if (name) course.name = name;
        if (description) course.description = description;
        if (price) course.price = price;
        if (duration) course.duration = duration;
        if (category) course.category = category;
        if (subject) course.subject = subject;
        if (rating) course.rating = parseFloat(rating);
        if (reviews) course.reviews = parseInt(reviews);
        if (approach) course.approach = approach;
        if (approachSubtitle) course.approachSubtitle = approachSubtitle;
        
        // Parse array fields
        const parseArrayField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field.filter(item => item && item.trim());
            return field.split('\n').map(item => item.trim()).filter(item => item);
        };
        
        if (whatYouWillLearn) course.whatYouWillLearn = parseArrayField(whatYouWillLearn);
        if (skillsYouWillGain) course.skillsYouWillGain = parseArrayField(skillsYouWillGain);
        if (descriptionPoints) course.descriptionPoints = parseArrayField(descriptionPoints);

        if (image) {
            try {
                const oldPath = course.image;
                if (oldPath) {
                    const filePath = path.join(process.cwd(), oldPath);
                    console.log('Attempting to delete old course image at:', filePath);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log('Deleted old course image:', filePath);
                    } else {
                        console.warn('Old course image not found:', filePath);
                    }
                }
            } catch (e) {
                console.warn('Could not remove old course image', e.message);
            }
            course.image = image.path;
        }

        await course.save();
        return res.json({ success: true, message: 'Course updated', course });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: 'Course id is required' });

        const course = await courseModel.findById(id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // Delete course image
        try {
            const oldPath = course.image;
            if (oldPath) {
                const filePath = path.join(process.cwd(), oldPath);
                console.log('Attempting to delete course image at:', filePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('Deleted course image:', filePath);
                } else {
                    console.warn('Course image not found:', filePath);
                }
            }
        } catch (e) {
            console.warn('Could not remove course image', e.message);
        }

        // Delete all video files from all modules and topics
        if (course.modules && Array.isArray(course.modules)) {
            for (const module of course.modules) {
                if (module.topics && Array.isArray(module.topics)) {
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
            }
        }

        await course.deleteOne();
        return res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteHackathon = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: 'Hackathon id is required' });

        const hack = await hackathonModel.findById(id);
        if (!hack) return res.status(404).json({ success: false, message: 'Hackathon not found' });

        try {
            const oldPath = hack.image;
            if (oldPath) {
                const filePath = path.join(process.cwd(), oldPath);
                console.log('Attempting to delete hackathon image at:', filePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('Deleted hackathon image:', filePath);
                } else {
                    console.warn('Hackathon image not found:', filePath);
                }
            }
        } catch (e) {
            console.warn('Could not remove hackathon image', e.message);
        }

        await hack.deleteOne();
        return res.json({ success: true, message: 'Hackathon deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createHackathon = async(req,res) =>{
    try {
        const {
            name, description, price, category, createdBy,
            subtitle, about, whoCanParticipate, rewards
        } = req.body;
        const image = req.file;

        if(!name || !price || !createdBy){
            return res.json({success:false, message: "Please Fill The Required Details"})
        }

        // Parse array fields
        const parseArrayField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field.filter(item => item && item.trim());
            return field.split('\n').map(item => item.trim()).filter(item => item);
        };

        await hackathonModel.create({
            name,
            description,
            category,
            createdBy,
            image: image?.path,
            price,
            subtitle: subtitle || "",
            about: about || "",
            whoCanParticipate: parseArrayField(whoCanParticipate),
            rewards: parseArrayField(rewards)
        });

        return res.json({success: true, message: "Hackathon Created Successfully"})

    } 
    catch (error) {
        return res.json({success:false, message:error.message});
    }
}

export const updateHackathon = async (req, res) => {
    try {
        const { 
            id, name, description, price, category,
            subtitle, about, whoCanParticipate, rewards
        } = req.body;
        const image = req.file;

        if (!id) return res.status(400).json({ success: false, message: 'Hackathon id is required' });

        const hack = await hackathonModel.findById(id);
        if (!hack) return res.status(404).json({ success: false, message: 'Hackathon not found' });

        if (name) hack.name = name;
        if (description) hack.description = description;
        if (price) hack.price = price;
        if (category) hack.category = category;
        if (subtitle) hack.subtitle = subtitle;
        if (about) hack.about = about;
        
        // Parse array fields
        const parseArrayField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field.filter(item => item && item.trim());
            return field.split('\n').map(item => item.trim()).filter(item => item);
        };
        
        if (whoCanParticipate) hack.whoCanParticipate = parseArrayField(whoCanParticipate);
        if (rewards) hack.rewards = parseArrayField(rewards);

        if (image) {
            try {
                const oldPath = hack.image;
                if (oldPath) {
                    const filePath = path.join(process.cwd(), oldPath);
                    console.log('Attempting to delete old hackathon image at:', filePath);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log('Deleted old hackathon image:', filePath);
                    } else {
                        console.warn('Old hackathon image not found:', filePath);
                    }
                }
            } catch (e) {
                console.warn('Could not remove old hackathon image', e.message);
            }
            hack.image = image.path;
        }

        await hack.save();
        return res.json({ success: true, message: 'Hackathon updated', hack });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const hackathonActive = async (req,res) =>{
    try {
        const {name} = req.body;
        if(!name){
            return res.json({success:false, message: "Enter The Hackathon Name "})
        }

        const hack = await hackathonModel.findOne({name});

        if(!hack){
            return res.json({success:false, message: "No such Hackathon"})
        }

        if(hack.active === true){
            return res.json({success: true, message: "Hackathon is Already in Active State"})
        }
        else{
            hack.active = true
            await hack.save();
        }

        return res.json({success: true, message: `${name} Hackathon is Now Activated`})

    } 
    catch (error) {
        return res.json({success:true, message:error.message})    
    }
}

export const hackathonDeactive = async (req,res) =>{
    try {
        const {name} = req.body;
        if(!name){
            return res.json({success:false, message: "Enter The Hackathon Name "})
        }
        
        const hack = await hackathonModel.findOne({name});

        if(!hack){
            return res.json({success:false, message: "No such Hackathon"})
        }

        if(hack.active === false){
            return res.json({success: true, message: "Hackathon is Already in Deactive State"})
        }
        else{
            hack.active = false
            await hack.save();
        }

        return res.json({success: true, message: `${name} Hackathon is Now Deactivated`})

    } 
    catch (error) {
        return res.json({success:true, message:error.message})    
    }
}