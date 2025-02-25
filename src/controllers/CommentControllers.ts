import { Request, Response } from 'express'; 
import Comment,{IComment} from '../models/CommentModel';
import { BaseController } from './baseController';
import userModel from '../models/AuthModel';

class CommentController extends BaseController<IComment> {
  constructor() {
    super(Comment);
  }

   async gatAllCommentsByPostId(req: Request, res: Response) {
    const postID = req.query.postId;
    console.log("GET ALL COMMENTS ON SPECIFIC POST METHOD");
    console.log(postID);
    try {
      const findAllComments = await Comment.find({ postId: postID }).select('content owner email and username');
      res.status(200).json(findAllComments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving comments", error });
    }
  }


  
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { content, postId } = req.body;

      if (!req.user || !req.user._id) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const user = await userModel.findById(req.user._id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (!content || !postId) {
        res.status(400).json({ message: "Content and postId are required" });
        return;
      }

      const newComment = await Comment.create({
        postId,
        owner: user._id,
        email: user.email,
        username: user.username, 
        content,
      });

      res.status(201).json({ message: "Comment created successfully", newComment });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  

  async updateComment(req: Request, res: Response) {
    const commentID = req.params._id;
    const newContent = req.body.comment;
    try {
      const commentToUpdate = await Comment.findByIdAndUpdate(
        commentID,
        { content: newContent },
        { new: true }
      );
      if (!commentToUpdate) {
        res.status(404).send("COULD NOT UPDATE COMMENT DUE TO AN ERROR!");
        return;
      } else {
        res.status(200).send(commentToUpdate);
        return;
      }
    } catch (error) {
      res.status(400).send(error);
      return;
    }
  }

  async deleteComment(req: Request, res: Response) {
    const commentID = req.params._id;
    try {
      const theComment = await Comment.findByIdAndDelete({
        _id: commentID,
      });
      if (!theComment) {
        res.status(404).send("Could not delete comment due to an error");
        return;
      } else {
        res.status(200).send(theComment);
        return;
      }
    } catch (error) {
      res.status(400).send(error);
      return;
    }
  }


}
export default new CommentController();
