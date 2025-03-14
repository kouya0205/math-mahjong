import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 環境変数ファイルのパスを明示的に指定
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/math-mahjong';

console.log('MongoDB URI:', MONGODB_URI); // 接続文字列をログに出力（デバッグ用）

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // 接続オプションを追加
      serverSelectionTimeoutMS: 5000, // サーバー選択タイムアウト
      socketTimeoutMS: 45000, // ソケットタイムアウト
    });
    console.log('MongoDB接続成功');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }
}; 