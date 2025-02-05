import { BaseController } from "./baseController";
import Post, { IPost } from "../models/PostModel";
import { Request, Response } from "express";

class PostController extends BaseController<IPost> {
  constructor(model: any) {
    super(model);
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
      const userId = req.user?._id;
      const image = req.file?.path;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      if (!req.body.title || !req.body.content) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      req.body.owner = userId;
      req.body.image = image;

      await super.create(req, res);
    } catch (error) {
      res.status(500).json({ message: "Error creating post", error });
    }
  }
}

export default new PostController(Post);
