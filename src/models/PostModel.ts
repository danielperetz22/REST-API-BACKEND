import mongoose, { Schema, model, Document } from 'mongoose';

export interface IPost {
  title: string;
  content: string;
  owner: string;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    owner: { type: String, required: true },
  },
);

const Post = mongoose.model<IPost>("Posts", postSchema);

export default Post;
