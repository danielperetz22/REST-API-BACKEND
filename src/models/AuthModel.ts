import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  tokens: string[]; 
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tokens: { type: [String], default: [] }, 
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);