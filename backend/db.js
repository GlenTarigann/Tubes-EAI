import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // String koneksi asli dari MongoDB Atlas Anda
    const uri = 'mongodb+srv://glentarigan-tubes:102022400308@tubeseai.oohmh89.mongodb.net/warehouse?retryWrites=true&w=majority&appName=TubesEAI';
    
    const conn = await mongoose.connect(uri);
    console.log(`🔌 Database MongoDB Terhubung: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error Koneksi: ${error.message}`);
    process.exit(1);
  }
};