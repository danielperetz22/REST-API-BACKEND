import mongoose, { Schema } from 'mongoose';

export interface IPost {
  title: string;
  content: string;
  owner: string;
  email?: string;
  username?: string;
  userProfileImage?: string;
  image: string;
  comments?: string[];
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    owner: { type: String, required: true },
    email: { type: String , required: true },
    username: { type: String, required: true },
    userProfileImage: { type: String, required: true },
    image: { type: String, required: true },
    comments: { type: [String], default: [] }, 
  }
);

const Post = mongoose.model<IPost>("Posts", postSchema);

export default Post;