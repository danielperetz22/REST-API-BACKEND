import Post from '../models/PostModel';
import { Request, Response } from 'express'; 
export const addPost = async (req : Request , res : Response) => {
    const { title, content, senderId } = req.body;
    console.log('Received POST request with data:', req.body);
  
    if (!title || !content || !senderId) {
      return res.status(400).json({
        message: 'Missing required fields: title, content, and senderId are required',
      });
    }
  
    try {
      const post = new Post(req.body); 
      await post.save(); 
  
      return res.status(201).json({
        message: 'Post added successfully',
        post: post,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'; 
      console.error('Error adding post:', errorMessage);
  
      return res.status(500).json({
        message: 'An error occurred while adding the post',
        error: errorMessage,
      });
    }
  };
  

export const getAllPosts = async (req : Request, res : Response) => {
  try {
    const posts = await Post.find(); 
    return res.status(200).json({
      message: 'Posts fetched successfully',
      posts: posts,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error fetching posts:', errorMessage);

    return res.status(500).json({
      message: 'An error occurred while fetching the posts',
      error: errorMessage,
    });
  }
};

export const getPostById = async (req : Request, res: Response) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: `Post with ID ${postId} not found`,
      });
    }

    return res.status(200).json({
      message: 'Post fetched successfully',
      post: post,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error fetching post with ID ${postId}:`, errorMessage);

    return res.status(500).json({
      message: 'An error occurred while fetching the post',
      error:errorMessage,
    });
  }
};

export const getPostsBySender = async (req : Request, res: Response) => {
  const senderId = req.query.senderId;

  if (!senderId) {
    return res.status(400).json({
      message: 'Sender ID is required',
    });
  }

  try {
    const posts = await Post.find({ senderId });

    if (posts.length === 0) {
      return res.status(404).json({
        message: `No posts found for sender ID ${senderId}`,
      });
    }

    return res.status(200).json({
      message: 'Posts fetched successfully',
      posts: posts,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'; 
    console.error(`Error fetching posts for sender ID ${senderId}:`,errorMessage);

    return res.status(500).json({
      message: 'An error occurred while fetching the posts',
      error: errorMessage,
    });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const updatePost = req.body;

  console.log('Received PUT request for ID:', postId);
  console.log('Update data:', updatePost);

  try {
    if (!postId) {
      return res.status(400).json({
        message: 'Post ID is required',
      });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: `Post with ID ${postId} not found`,
      });
    }
    const updatedPost = await Post.findByIdAndUpdate(postId, updatePost, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error updating post with ID ${postId}:`, errorMessage);

    return res.status(500).json({
      message: 'An error occurred while updating the post',
      error: errorMessage,
    });
  }
};

export default { addPost, getAllPosts, getPostById, getPostsBySender, updatePost };
