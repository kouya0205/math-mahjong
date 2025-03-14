import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/math-mahjong';
console.log('Connecting to MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB接続成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }); 