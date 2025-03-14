import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { setupSocketHandlers } from './socket/handlers';

dotenv.config();


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// ミドルウェア
app.use(cors());
app.use(express.json());

// MongoDB接続
connectDB();

// Socket.ioハンドラーのセットアップ
setupSocketHandlers(io);

// 基本的なルート
app.get('/', (req, res) => {
  res.send('数学麻雀サーバー稼働中');
});

// サーバー起動
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
}); 