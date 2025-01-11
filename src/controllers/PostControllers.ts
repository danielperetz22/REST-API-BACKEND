import mongoose from 'mongoose';
import Post from '../models/PostModel';
import { Request, Response } from 'express'; 



export const addPost = async (req: Request, res: Response) => {
  const { title, content, senderId } = req.body;
  if (!title || !content || !senderId) {
    res.status(400).json({ message: 'Missing required fields: title, content, and senderId are required' });
    return
  }

  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Error adding post', error: String(error) });
  }
};
  

export const getAllPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: String(error) });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
     res.status(400).json({ message: 'Invalid post ID format' });
     return
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: `Post with ID ${req.params.id} not found` });
      return
    }
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: String(error) });
  }
};

export const getPostsBySender = async (req: Request, res: Response) => {
  const { senderId } = req.query;
  if (!senderId) {
    res.status(400).json({ message: 'Sender ID is required' });
    return
  }

  try {
    const posts = await Post.find({ senderId });
    if (!posts.length) {
      res.status(404).json({ message: `No posts found for sender ID ${senderId}` });
      return
    }
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: String(error) });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "Request body cannot be empty" });
    return
  }
  try {
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      res.status(404).json({ message: `Post with ID ${id} not found` });
      return;
    }
    const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json({ post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error updating posts', error: String(error) });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("DELETE request received with ID:", id);

  try {
    const deletedPost = await Post.findByIdAndDelete(id);
    console.log("Deleted post:", deletedPost);

    if (!deletedPost) {
      res.status(404).json({ message: `Post with ID ${id} not found` });
      return;
    }

    res.status(200).json({ message: "Post deleted successfully",post: deletedPost });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error: String(error) });
  }
};



export default { addPost, getAllPosts, getPostById, getPostsBySender, updatePost, deletePost };
