import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn("⚠️ MONGODB_URI not set — skipping DB connection in this environment");
            return;
        }
        await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        // Don't exit the process in serverless environments — let the function return errors per-request
    }
};


export default connectDB;