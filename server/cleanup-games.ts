import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// 環境変数ファイルのパスを明示的に指定
dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/math-mahjong';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB接続成功');
    
    // Gameモデルを取得
    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));
    
    // すべてのゲームドキュメントを削除
    const result = await Game.deleteMany({});
    console.log(`${result.deletedCount}件のゲームドキュメントを削除しました`);
    
    // 接続を閉じる
    await mongoose.connection.close();
    console.log('MongoDB接続を閉じました');
    process.exit(0);
  })
  .catch((error) => {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }); 