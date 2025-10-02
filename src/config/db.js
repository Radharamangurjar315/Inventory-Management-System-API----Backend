import mongoose from "mongoose";
import {MONGO_URI} from "./env.js";

export const connectDB = async () => {
    try{
        await mongoose.connect.MONGO_URI;
        console.log("MongoDB connected!!!");
    } catch(error){
        console.error("DB connection Failed", error.message);
        process.exit(1);
    }
};