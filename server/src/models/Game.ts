import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  roomId: string;
  players: {
    userId: mongoose.Types.ObjectId;
    name: string;
    score: number;
    handCount: number;
  }[];
  currentPlayerIndex: number;
  status: 'waiting' | 'playing' | 'finished';
  winner?: {
    userId: mongoose.Types.ObjectId;
    name: string;
    score: number;
  };
  lastAction?: {
    playerId: mongoose.Types.ObjectId;
    expression: string;
    value: number;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    handCount: { type: Number, default: 7 }
  }],
  currentPlayerIndex: {
    type: Number,
    default: 0
  },
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  winner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    score: Number
  },
  lastAction: {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expression: String,
    value: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IGame>('Game', GameSchema); 