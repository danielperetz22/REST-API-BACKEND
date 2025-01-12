import mongoose from 'mongoose';


export interface IComment{
  content: string;
  postId: string; 
  owner: string;
}
const comments_Schema = new mongoose.Schema<IComment>({
    content: {
      type: String, required: true,},
    postId: {
      type: String, required: true,},
    owner: {
      type: String, required: true,},
  },
);
const Comment= mongoose.model<IComment>("Comments", comments_Schema);
export default Comment;
