import mongoose from "mongoose";
import { MONGO_URI } from "./env.js";

export const connectDB = async () => {
  if (!MONGO_URI) {
    console.error("DB connection failed: MONGO_URI is not defined. Check your .env file and env.js");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected!");
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};
