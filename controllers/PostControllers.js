const Post = require('../models/PostModel');

exports.createPost = async (req, res) => {
  try {
    const { title, content, owner, senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ message: "senderId is required" });
    }

    const newPost = new Post({
      title,
      content,
      owner,
      senderId,
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create post',
      error: error.message,
    });
  }
};


