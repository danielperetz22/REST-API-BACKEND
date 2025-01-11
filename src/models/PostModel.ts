import mongoose, { Schema, model, Document } from 'mongoose';

interface IPost extends Document {
  title: string;
  content: string;
  senderId: string;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    senderId: { type: String, required: true },
  },
  { timestamps: true }
);

const Post = model<IPost>('Post', postSchema);

export default Post;
