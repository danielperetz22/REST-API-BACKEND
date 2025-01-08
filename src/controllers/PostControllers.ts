import Post from '../models/PostModel';
import { Request, Response } from 'express'; 
export const addPost = async (req : Request , res : Response) => {
       const title = req.body.title;
       const content = req.body.content; 
        const senderId = req.body.senderId;
    
    console.log('Received POST request with data:', req.body);
  
    if (!title || !content || !senderId) {
       res.status(400).json({
        message: 'Missing required fields: title, content, and senderId are required',
      });
      return
    }
  
    try {
      const post =await Post.create({
        title: title,
        content: content,
        senderId: senderId,
      });
             res.status(201).json({
        message: 'Post added successfully',
        post: post,
      });
      return
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'; 
      console.error('Error adding post:', errorMessage);
  
       res.status(500).json({
        message: 'An error occurred while adding the post',
        error: errorMessage,
      });
      return
    }
  };
  

export const getAllPosts = async (req : Request, res : Response) => {
  try {
    const posts = await Post.find(); 
     res.status(200).json({
      message: 'Posts fetched successfully',
      posts: posts,
    });
    return
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching posts:', errorMessage);

     res.status(500).json({
      message: 'An error occurred while fetching the posts',
      error: errorMessage,
    });
    return
  }
};

export const getPostById = async (req : Request, res: Response) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);

    if (!post) {
       res.status(404).json({
        message: `Post with ID ${postId} not found`,
      });
      return
    }

     res.status(200).json({
      message: 'Post fetched successfully',
      post: post,
    });
    return
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error fetching post with ID ${postId}:`, errorMessage);

     res.status(500).json({
      message: 'An error occurred while fetching the post',
      error:errorMessage,
    });
    return
  }
};

export const getPostsBySender = async (req : Request, res: Response) => {
  const senderId = req.query.senderId;

  if (!senderId) {
     res.status(400).json({
      message: 'Sender ID is required',
    });
    return
  }
  try {
    const posts = await Post.find({ senderId });

    if (posts.length === 0) {
       res.status(404).json({
        message: `No posts found for sender ID ${senderId}`,
      });
      return
    }
     res.status(200).json({
      message: 'Posts fetched successfully',
      posts: posts,
    });
    return
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'; 
    console.error(`Error fetching posts for sender ID ${senderId}:`,errorMessage);

     res.status(500).json({
      message: 'An error occurred while fetching the posts',
      error: errorMessage,
    });
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
      res.status(400).json({
        message: 'Post ID is required',
      });
      return
    }
    const post = await Post.findById(postId);
    if (!post) {
        res.status(404).json({
        message: `Post with ID ${postId} not found`,
      });
      return
    }
    const updatedPost = await Post.findByIdAndUpdate(postId, updatePost, {
      new: true,
      runValidators: true,
    });
     res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
    return
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error updating post with ID ${postId}:`, errorMessage);

      res.status(500).json({
      message: 'An error occurred while updating the post',
      error: errorMessage,
    });
    return
  }
};

export default { addPost, getAllPosts, getPostById, getPostsBySender, updatePost };
