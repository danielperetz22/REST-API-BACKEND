const Comment = require('../models/CommentModel');

exports.createComment = async (req, res) => { // create a new comment
  try {
    const { content, postId, owner } = req.body;

    if(!content) return res.status(400).json({ message: 'Content is required' });
    if(!postId) return res.status(400).json({ message: 'Post ID is required' });
    if(!owner) return res.status(400).json({ message: 'Owner is required' });

    console.log('Creating a new comment for post ID:', postId);

    const newComment = new Comment({
      content,
      postId,
      owner,
    });

    await newComment.save();

    console.log('Comment created successfully:', newComment);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: newComment,
    });

  } catch (error) {
    console.error('error creating comment:', error.message);
    res.status(500).json({
      message: 'Failed to create comment',
      error: error.message,
    });
  }
};

exports.getAllComments = async (req, res) => {    // fetch all comments
  try {
    const comments = await Comment.find();

    res.status(200).json({
      message: 'Comments fetched successfully',
      comments: comments,
    });

  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({
      message: 'Failed to fetch comments',
      error: error.message,
    });
  }
};

exports.getCommentsByPost = async (req, res) => { // fetch comments by post ID
  try {
    const {postId} = req.params;

    if(!postId) {
      return res.status(400).json({ message: 'Post ID is required' }); 
    }

    const comments = await Comment.find({ postId });

    res.status(200).json({
      message: 'Comments fetched successfully for the post',
      comments: comments,
    });
  } catch(error) {
    console.error('Error fetching comments for post:', error.message);
    res.status(500).json({
      message: 'Failed to fetch comments',
      error: error.message,
    });
  }
};

exports.updateComment = async (req, res) => { // update a comment
  try {
    const { id } = req.params;
    const { content, owner } = req.body;

    if(!content || !owner) {
      return res.status(400).json({ message: 'Content and owner are required' });
    }

    const comment = await Comment.findById(id);

    const updatedComment = await Comment.findByIdAndUpdate(id, {content, owner}, {new: true, runValidators: true});

    if(!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch(error) {
    console.error('Error updating comment:', error.message);
    res.status(500).json({
      message: 'Failed to update comment',
      error: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => { // delete a comment
  try {
    const { id } = req.params;

    const comment = await Comment.findByIdAndDelete(id);

    if(!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({
      message: 'Comment deleted successfully',
      comment: deletedComment,
    });
  } catch(error) {
    console.error('Error deleting comment:', error.message);
    res.status(500).json({
      message: 'Failed to delete comment',
      error: error.message,
    });
  }
};


