import { BaseController } from "./baseController";
import Post, { IPost } from "../models/PostModel";
import Comment from "../models/CommentModel";
import { Request, Response } from "express";
import { log } from "console";
import mongoose from "mongoose";

class PostController extends BaseController<IPost> {
  constructor() {
    super(Post);
  }

  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { title, content } = req.body;
      if (!title || !content) {
        res.status(400).json({ message: "Missing data" });
        return;
      }

      const postToUpdate = await Post.findByIdAndUpdate(
        req.params._id,
        { title, content },
        { new: true }
      );

      if (!postToUpdate) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      res.status(200).json(postToUpdate);
    } catch (error) {
      res.status(500).json({ message: "Error updating post", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("📩 Incoming request:", req.body);
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
      }
      const { title, content } = req.body;
      if (!title || !content) {
        res.status(400).json({ message: "Missing required fields: title and content" });
        return;
      }
      const userEmail = req.user?.email || "unknown@example.com";
      const userUsername = req.user?.username || "Anonymous";
      const userProfileImage = req.user?.profileImage || "https://example.com/default-avatar.jpg";
      const imagePath = req.file ? `uploads/${req.file.filename}` : "https://example.com/default-image.jpg";

  
      const newPost = new Post({
        title,
        content,
        email: userEmail,
        username: userUsername,
        userProfileImage: userProfileImage,
        owner: userId,
        image: imagePath,
        comments: []
      });
  
      const savedPost = await newPost.save();
      console.log("✅ Post successfully created:", savedPost);
  
      res.status(201).json(savedPost);
    } catch (error) {
      console.error("❌ Error creating post:", error);
      res.status(500).json({ message: "Error creating post", error });
    }
  }
  

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const posts = await Post.find();

      const postsWithComments = await Promise.all(
        posts.map(async (post) => {
          const comments = await Comment.find({ postId: post._id });
          return { ...post.toObject(), comments };
        })
      );

      res.status(200).json(postsWithComments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts", error });
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    try{
      const post = await Post.findById(req.params.id);

      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "You are not authorized to delete this post" });
      return;
    }

    await post.deleteOne(); 
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
}
async getPostById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid post ID format" });
      return;
    }

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving post", error });
  }
}

}

export default new PostController();