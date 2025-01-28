import { BaseController } from './baseController';
import Post,{IPost} from '../models/PostModel';
import { Request, Response } from 'express'; 


class PostController extends BaseController<IPost> {
  constructor(model : any) {
    super(model);
  }
  

  async updatePost(req: Request, res: Response) {
    const askerID = req.params._id;
    const newtitle = req.body.title;
    const newContent = req.body.content;
    try {
      const postToUpdate = await Post.findByIdAndUpdate(
        askerID,
        { title: newtitle, content: newContent },
        { new: true }
      );
      if(!newtitle || !newContent){
        res.status(400).send("Missing Data");
        return;
      }
      if (!postToUpdate) {
        res.status(404).send("could not find post");
        return;
      } else {
        res.status(200).send(postToUpdate);
        return;
      }
    } catch (error) {
      res.status(400).send(error);
      return;
    }
  }
  async create(req: Request, res: Response) {
    const userId = req.user?._id; 
    const image = req.file?.path; 
  
    if (!userId || !image) {
      res.status(400).send("Unauthorized or missing image");
      return;
    }
  
    const post = {
      title: req.body.title,
      content: req.body.content,
      owner: userId,
      image,
    };
  
    if (!post.owner || !post.content || !post.title || !post.image) {
      res.status(400).send("Missing Data");
      return;
    }
  
    req.body = post;
    return super.create(req, res);
  }


}

export default new PostController(Post);