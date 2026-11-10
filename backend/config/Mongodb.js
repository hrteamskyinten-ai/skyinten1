import mongoose from "mongoose";

const Db_connection = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Skyinten";
        await mongoose.connect(uri);
        console.log("Database is connected");
    } catch (error) {
        console.error("Database connection error:", error.message);
        console.log("Running server without MongoDB connection (some database features may be unavailable until MongoDB is running).");
    }
};

export default Db_connection;