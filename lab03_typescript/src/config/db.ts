import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mtse_lab02_ts';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB (TS)');
    } catch (err: any) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

export default connectDB;
