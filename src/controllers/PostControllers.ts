import Post from '../models/PostModel';
import { Request, Response } from 'express'; 
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}

export const addPost = async (req : Request , res : Response) => {
    const { title, content, senderId } = req.body;
    console.log('Received POST request with data:', req.body);
  
    if (!title || !content || !senderId) {
       res.status(400).json({message: 'Missing required fields: title, content, and senderId are required',});
      return;
    }
  
    try {
      const post = new Post(req.body); 
      await post.save(); 
  
       res.status(201).json({message: 'Post added successfully',post: post,});
       return
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'; 
      console.error('Error adding post:', errorMessage);
  
       res.status(500).json({message: 'An error occurred while adding the post',error: errorMessage,});
        return
    }
  };
  

export const getAllPosts = async (req : Request, res : Response) => {
  try {
    const posts = await Post.find(); 
     res.status(200).json({message: 'Posts fetched successfully',posts: posts,});
      return
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching posts:', errorMessage);

     res.status(500).json({message: 'An error occurred while fetching the posts',error: errorMessage,});
      return
  }
};

export const getPostById = async (req : Request, res: Response) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);

    if (!post) {
       res.status(404).json({message: `Post with ID ${postId} not found`,});
      return
    }

     res.status(200).json({message: 'Post fetched successfully',post: post,});
      return
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error fetching post with ID ${postId}:`, errorMessage);

     res.status(500).json({message: 'An error occurred while fetching the post',error:errorMessage,});
     return
  }
};

export const getPostsBySender = async (req : Request, res: Response) => {
  const senderId = req.query.senderId;

  if (!senderId) {
     res.status(400).json({message: 'Sender ID is required',});
      return
  }

  try {
    const posts = await Post.find({ senderId });

    if (posts.length === 0) {
       res.status(404).json({message: `No posts found for sender ID ${senderId}`,});
      return
    }

     res.status(200).json({message: 'Posts fetched successfully',posts: posts,});
     return
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'; 
    console.error(`Error fetching posts for sender ID ${senderId}:`,errorMessage);

     res.status(500).json({message: 'An error occurred while fetching the posts',error: errorMessage,});
      return
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const updatePost = req.body;

  console.log('Received PUT request for ID:', postId);
  console.log('Update data:', updatePost);

  try {
    if (!postId) {
       res.status(400).json({message: 'Post ID is required',});
      return
    }
    const post = await Post.findById(postId);
    if (!post) {
       res.status(404).json({message: `Post with ID ${postId} not found`,});
      return
    }
    const updatedPost = await Post.findByIdAndUpdate(postId, updatePost, {
      new: true,
      runValidators: true,
    });
     res.status(200).json({message: 'Post updated successfully',post: updatedPost,});
      return
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error updating post with ID ${postId}:`, errorMessage);

     res.status(500).json({message: 'An error occurred while updating the post',error: errorMessage,});
      return
  }
};

// Middleware for Authentication
export const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload; // Attach payload to the request for downstream use
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Controller for Creating a Post
export const createPost = async (req: Request, res: Response) => {
  const { title, content, owner } = req.body;

  // Validate required fields
  if (!title || !content || !owner) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Simulate saving to the database (replace with actual DB logic)
    const newPost = {
      id: 'generated-post-id',
      title,
      content,
      owner,
      createdAt: new Date(),
    };

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Failed to create post' });
  }
};


export default { addPost, getAllPosts, getPostById, getPostsBySender, updatePost, authenticate, createPost };
