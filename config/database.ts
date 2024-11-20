import mongoose from 'mongoose';

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('Connected to Database');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

export default connectToDatabase;
