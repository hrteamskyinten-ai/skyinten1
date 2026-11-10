import userModel from "../models/user_schema.js";

const adminAuth = async (req,res,next) =>{
    const {userId} = req.body;

    try { 

        const user = await userModel.findById(userId);

        if(user.role === "admin") {
            next();
        }
        // else{
        //     return res.json({success: false, message: "You are not the admin" })
        // }
    
    }
    catch (error) {
       return res.json({success:false, message:error.message}); 
    }
}

export default adminAuth;