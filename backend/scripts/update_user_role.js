import mongoose from "mongoose";
import userModel from "../models/user_schema.js";
import dotenv from "dotenv";

dotenv.config();

const updateUserRole = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find admin user (usually the first user in the system)
    const adminUser = await userModel.findOne({ role: "admin" });
    
    if (!adminUser) {
      console.log("❌ No admin user found");
      process.exit(1);
    }

    console.log(`Found user: ${adminUser.email} (ID: ${adminUser._id})`);
    console.log(`Current role: ${adminUser.role}`);

    // Update user to have tutor role
    adminUser.role = "tutor";
    await adminUser.save();

    console.log(`✅ Role updated successfully!`);
    console.log(`New role: ${adminUser.role}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

updateUserRole();
