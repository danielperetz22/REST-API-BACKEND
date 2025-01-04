import mongoose, { Schema, Document, Model } from 'mongoose';

interface IPost extends Document {
  title: string;
  content: string;
  owner?: string; 
  senderId: string;
  createdAt?: Date; 
  updatedAt?: Date; 
}

const postSchema: Schema<IPost> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: false,
    },
    senderId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } 
);

const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);
export default Post;
