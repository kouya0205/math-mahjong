import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  socketId: string;
  createdAt: Date;
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IUser>('User', UserSchema); 