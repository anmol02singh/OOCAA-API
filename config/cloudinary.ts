import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import cron from "node-cron"
import { cleanCloudinary } from "../repositories/accountRepository";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export default cloudinary;

//Scheduler for cloudinary unmatched folder cleanup.
export async function scheduleCleanCloudinary() {
    cron.schedule('0 4 * * 6', () => {
        console.log('Running Cloudinary Cleanup on Saturday at 4am.');
        cleanCloudinary();
    });    
}