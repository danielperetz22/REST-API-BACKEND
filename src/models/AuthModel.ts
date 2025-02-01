import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  refeshtokens: string[]; 
  profileImage?: string;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, default: "" },
    refeshtokens: { type: [String], default: [] }, 
    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);