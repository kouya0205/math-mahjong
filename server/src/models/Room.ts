import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  name: string;
  gameMode: string;
  players: {
    userId: mongoose.Types.ObjectId;
    name: string;
    isHost: boolean;
  }[];
  status: 'waiting' | 'playing' | 'finished';
  gameId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, default: '数学麻雀ルーム' },
  gameMode: { type: String, required: true },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    isHost: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRoom>('Room', RoomSchema); 