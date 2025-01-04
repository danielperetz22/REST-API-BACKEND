import { Request, Response } from 'express'; 
import Comment from '../models/CommentModel';
import Post from '../models/PostModel';

const createComment = async (req: Request, res: Response) => {
  console.log('Attempting to create comment');
  const { content, postId, owner } = req.body;

  if (!content || !postId || !owner) {
    return res.status(400).json({ message: 'Content, postId, and owner are required' });
  }

  try {
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const newComment = new Comment({ content, postId, owner });
    const savedComment = await newComment.save();

    return res.status(201).json(savedComment);
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error creating comment:', errorMessage);
    return res.status(500).json({ message: 'Error creating comment', error: errorMessage });
  }
};

const getAllComments = (req: Request, res: Response) => {
  console.log('Attempting to fetch all comments');
  Comment.find()
    .then((comments) => res.status(200).json(comments))
    .catch((err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      res.status(500).json({ message: 'Error fetching comments', error: errorMessage });
    });
};

const getCommentsByPost = (req: Request, res: Response) => {
  console.log('Attempting to fetch comments by post');
  const { postId } = req.params;

  Comment.find({ postId })
    .then((comments) => res.status(200).json(comments))
    .catch((err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      res.status(500).json({ message: 'Error fetching comments for post', error: errorMessage });
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
    .catch((err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      res.status(500).json({ message: 'Error fetching comment', error: errorMessage });
    });
};

const updateComment = (req: Request, res: Response) => {
  console.log('Attempting to update comment');
  const { commentId } = req.params;
  const { content, owner } = req.body;

  if (!content || !owner) {
    return res.status(400).json({ message: 'Content and owner are required' });
  }

  Comment.findByIdAndUpdate(commentId, { content, owner }, { new: true, runValidators: true })
    .then((updatedComment) => {
      if (!updatedComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      res.status(200).json(updatedComment);
    })
    .catch((err: any) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      res.status(500).json({ message: 'Error updating comment', error: errorMessage });
    });
};

const deleteComment = async (req: Request, res: Response) => {
  console.log('Attempting to delete comment');
  const { commentId } = req.params;

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error deleting comment:', errorMessage);
    return res.status(500).json({ message: 'Failed to delete comment', error: errorMessage });
  }
};

export default { createComment, getAllComments, getCommentsByPost, getCommentById, updateComment, deleteComment };
