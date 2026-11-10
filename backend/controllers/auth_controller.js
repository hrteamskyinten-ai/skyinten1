import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user_schema.js";
import tutorModel from "../models/tutor_schema.js";
import transporter from "../config/nodemailer.js";


// Register Controller
export const register = async (req, res) => {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Please fill the required details" })
    }

    try {

        // Check if email already exists in either user or tutor model
        const existingUser = await userModel.findOne({email});
        const existingTutor = await tutorModel.findOne({email});

        if (existingUser || existingTutor) {
            return res.json({ success: false, message: "User already Exists with same email" })
        }

        const hasedPassword = await bcrypt.hash(password, 10);

        let token;

        if (role === "tutor") {
            // Save to Tutor model
            const tutor = new tutorModel({name, email, password: hasedPassword});
            await tutor.save();
            token = jwt.sign({id: tutor._id, role: "tutor"}, process.env.JWT_SECRET, {expiresIn: "7d"});
        } else {
            // Save to User model
            const user = new userModel({name, email, password: hasedPassword, role: "user"});
            await user.save();
            token = jwt.sign({id: user._id, role: "user"}, process.env.JWT_SECRET, {expiresIn: "7d"});
        }

        res.cookie("token", token, {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }); 

        return res.json({success:true, message:"Registered Successfully"});

    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }

}


// Login Controller
export const login = async (req,res) =>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success:false, message:"Email and password are required"})
    }

    try {

        // Check in User model first
        let user = await userModel.findOne({email});
        let userRole = "user";

        // If not found in user model, check in tutor model
        if(!user){
            user = await tutorModel.findOne({email});
            userRole = "tutor";
        }

        if(!user){
            return res.json({success:false, message:"User Not Registred"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success:false, message:"Wrong Password"})
        }

        const token = jwt.sign({id: user._id, role: userRole}, process.env.JWT_SECRET, {expiresIn : "7d"});

        res.cookie("token", token, {
            httpOnly: true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        return res.json({success:true, message:"Logged in Successfully"});

    } 
    catch (error) {
        return res.json({success: false, message:error.message})    
    }
}

// Logout Controller
export const logout = async (req,res) =>{
    try {

        res.clearCookie("token",{
            httpOnly: true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? "none" : "strict"
        })

        return res.json({success:true, message:"Logged Out"});

    } 
    catch (error) {
        return res.json({success: false , message:error.message});    
    }
}


// Send Otp Controller
export const sendOtp = async (req,res) =>{
    try {

        const {userId} = req.body;

        const user = await userModel.findById(userId);
        

        if(user.isAccountVerified){
            return(res.json({success:false, message:"Account is verified"}));
        }

        const Otp = String(Math.floor(100000 + Math.random() * 900000));

        const now = new Date();

        const time = now.toLocaleTimeString('en-GB',{
            minute: '2-digit',
        });

        user.verifyOtp = Otp;
        user.verifyOtpExpireAt = time * 60 - (5 * 60)

        await user.save();

        const otpMail = {
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Account Verification Otp",
            text: `Your Otp is ${Otp} `
        }

        await transporter.sendMail(otpMail);

        res.json({success:true, message: "Otp sent Successfully"});
        
    }
    catch (error) {
        return(res.json({success: false, message:error.message}));
    }

}

// Verify Mail Controller
export const verifyMail = async (req,res) =>{
    const {userId,otp} = req.body;

    if(!userId || !otp){
        return res.json({success:false, message:"Missing Details"});
    }

    try {
        const user = await userModel.findById(userId);

        if(!user){
            return(res.json({success:false, message:" User not found"}));
        }

        if(user.verifyOtp = "" || user.verifyOtp !== otp){
            return(res.json({success:false, message:"Invalid Otp Or Otp Expired"}));
        }
        
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();
        
        return(res.json({success:true, message:"Email Verified Successfully"}));

    }
    catch (error) {
        return res.json({success:false, message:error.message});    
    }

}

// Authenticated Check Controller
export const isAuthenticated = async (req,res) =>{

    try {
        return res.json({success:true})    
    } 
    catch (error) {
       return res.json({success:false, message: error.message});
    }
}

// Password Reset Otp Controller

export const passResetOtp = async (req,res) =>{

    const {email} = req.body;

    if(!email){
        return res.json({success:false, message: "Please enter the Email ID"});
    }

    try {

        // Try finding a user in User model first, then in Tutor model
        let user = await userModel.findOne({email});
        let isTutor = false;
        if(!user){
            user = await tutorModel.findOne({email});
            isTutor = !!user;
        }

        if(!user){
            return res.json({success:false, message: "User Not Found"});
        }

        const Otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = Otp;
        user.resetOtpExpireAt = Date.now() + 5 * 60 * 1000;

        await user.save();

        const otpMail = {
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Password Reset Otp",
            text: `Your Otp is ${Otp} for resetting your password `
        }

        await transporter.sendMail(otpMail);

        return res.json({success:true, message: "Password Reset Otp Sent Successfully"});

    } 
    catch (error) {
        return res.json({success:false, message: error.message});    
    }
}

// Password Reset Controller

export const passwordReset = async (req,res) =>{

    const {email,newPassword,otp} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success:true, message: "Please Fill The Required Details"});
    }

    try {

        // Try finding in User model first, then Tutor model
        let user = await userModel.findOne({email});
        let isTutor = false;
        if(!user){
            user = await tutorModel.findOne({email});
            isTutor = !!user;
        }

        if(!user){
            return res.json({success:false, message: "User Not Found"});
        }

        if(!user.resetOtp || user.resetOtp !== otp){
            return res.json({success:false, message: "Otp is invalid or expired try again"});
        }

        const hasedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hasedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success:true, message: "Password Reset Successfully"});

    } 
    catch (error) {
        return res.json({success:false, message: error.message});   
    }

} 
