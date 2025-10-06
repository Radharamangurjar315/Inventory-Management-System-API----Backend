import dotenv from "dotenv";
process.env.DOTENV_CONFIG_QUIET = true;
const { error } = dotenv.config();


if (error) {
  console.warn(`Failed to load .env file: ${error.message}`);
} else {
  console.log(`Environment variables loaded successfully`);
}

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
