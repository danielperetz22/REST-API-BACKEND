import { Request, Response } from 'express'; 
import Comment from '../models/CommentModel';
import Post from '../models/PostModel';

const createComment = async (req: Request, res: Response) => {
  console.log('Attempting to create comment');
  const { content, postId, owner } = req.body;

  if (!content || !postId || !owner) {
     res.status(400).json({ message: 'Content, postId, and owner are required' });
      return
  }

  try {
    const postExists = await Post.findById(postId);
    if (!postExists) {
       res.status(404).json({ message: 'Post not found' });
        return
    }
    const newComment = new Comment({ content, postId, owner });
    const savedComment = await newComment.save();

     res.status(201).json(savedComment);
      return
  } catch (error: any) {
     res.status(500).json({ message: 'Error creating comment', error: String(error) });
      return
  }
};

const getAllComments = (req: Request, res: Response) => {
  console.log('Attempting to fetch all comments');
  Comment.find()
    .then((comments) => res.status(200).json(comments))
    .catch((error: any) => {
      res.status(500).json({ message: 'Error fetching comments', error: String(error) });
    });
};

const getCommentsByPost = (req: Request, res: Response) => {
  console.log('Attempting to fetch comments by post');
  const { postId } = req.params;

  Comment.find({ postId })
    .then((comments) => res.status(200).json(comments))
    .catch((error: any) => {
      res.status(500).json({ message: 'Error fetching comments for post', error: String(error) });
    });
};

const getCommentById = (req: Request, res: Response) => {
  console.log('Attempting to fetch comment by ID');
  const { commentId } = req.params;

  Comment.findById(commentId)
    .then((comment) => {
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      res.status(200).json(comment);
    })
    .catch((error: any) => {
      res.status(500).json({ message: 'Error fetching comment', error: String(error) });
    });
};

const updateComment = (req: Request, res: Response) => {
  console.log('Attempting to update comment');
  const { commentId } = req.params;
  const { content, owner } = req.body;

  if (!content || !owner) {
     res.status(400).json({ message: 'Content and owner are required' });
      return
  }

  Comment.findByIdAndUpdate(commentId, { content, owner }, { new: true, runValidators: true })
    .then((updatedComment) => {
      if (!updatedComment) {
         res.status(404).json({ message: 'Comment not found' });
          return
      }
      res.status(200).json(updatedComment);
    })
    .catch((error: any) => {
      res.status(500).json({ message: 'Error updating comment', error: String(error) });
    });
};

const deleteComment = async (req: Request, res: Response) => {
  console.log('Attempting to delete comment');
  const { commentId } = req.params;

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
       res.status(404).json({ message: 'Comment not found' });
        return
    }

   res.status(200).json({ message: 'Comment deleted successfully' });
   return
  } catch (error) {
     res.status(500).json({ message: 'Failed to delete comment', error: String(error) });
     return
  }
};

const deleteAllComments = async (req: Request, res: Response) => {
  try{
    await Comment.deleteMany({});
    res.status(200).json({ message: 'All comments deleted successfully' });
  }catch(error){
    res.status(500).json({ message: 'Error deleting all comments', error: String(error) });
  }
};

export default { createComment, getAllComments, getCommentsByPost, getCommentById, updateComment, deleteComment,deleteAllComments };
