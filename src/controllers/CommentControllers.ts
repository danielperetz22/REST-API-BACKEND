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
    try {
      const findAllComments = await Comment.find({ postId: postID }).select("content owner email username");
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

  async updateComment(req: Request, res: Response): Promise<void> {
    const commentID = req.params._id;
    const newContent = req.body.comment;

    try {
        const comment = await Comment.findById(commentID);

        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }

        console.log("Comment Owner:", comment.owner.toString());
        console.log("Request User ID:", req.user?._id.toString());

        if (!req.user || !req.user._id) {
          res.status(401).json({ message: "User not authenticated" });
          return;
        }

        if (comment.owner.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: "Unauthorized to edit this comment" });
            return;
        }

        comment.content = newContent;
        await comment.save();

        res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        res.status(500).json({ message: "Error updating comment", error });
    }
}

  async deleteComment(req: Request, res: Response) {
    const commentID = req.params._id;
    try {
      const comment = await Comment.findById(commentID);
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      if (!req.user || !req.user._id) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      if (comment.owner.toString() !== req.user._id.toString()) {
          res.status(403).json({ message: "Unauthorized to delete this comment" });
          return;
      }
      await Comment.findByIdAndDelete(commentID);
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting comment", error });
    }
  }
}

export default new CommentController();
