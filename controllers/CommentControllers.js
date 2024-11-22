const Comment = require('../models/CommentModel');

exports.createComment = async (req, res) => {
  try {
    const { content, postId, owner } = req.body;

    if (!content || !postId || !owner) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const newComment = new Comment({
      content,
      postId,
      owner,
    });

    await newComment.save();

    res.status(201).json({
      message: 'Comment created successfully',
      comment: newComment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create comment',
      error: error.message,
    });
  }
};
