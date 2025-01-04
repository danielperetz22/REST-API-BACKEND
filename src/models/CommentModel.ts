import mongoose, { Schema, Document, Model } from 'mongoose';


interface IComment extends Document {
  content: string;
  postId: mongoose.Types.ObjectId; 
  owner: string;
  createdAt?: Date; 
  updatedAt?: Date; 
}
const commentSchema: Schema<IComment> = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } 
);
const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;
