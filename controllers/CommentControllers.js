const Comment = require('../models/CommentModel');

const createComment = (req, res) => {
  console.log('Attempting to create comment');
  const { content, postId, owner } = req.body;

  if (!content || !postId || !owner) {
      return res.status(400).json({ message: 'Content, postId, and owner are required' });
  }

  const newComment = new Comment({ content, postId, owner });

  newComment.save()
      .then((comment) => res.status(201).json(comment))
      .catch((err) => res.status(500).json({ message: 'Error creating comment', error: err.message }));
};

const getAllComments = (req, res) => {
  console.log('Attempting to fetch all comments');
  Comment.find()
      .then((comments) => res.status(200).json(comments))
      .catch((err) => res.status(500).json({ message: 'Error fetching comments', error: err.message }));
};

const getCommentsByPost = (req, res) => {
  console.log('Attempting to fetch comments by post');
  const { postId } = req.params;

  Comment.find({ postId })
      .then((comments) => res.status(200).json(comments))
      .catch((err) => res.status(500).json({ message: 'Error fetching comments for post', error: err.message }));
};

const getCommentById = (req, res) => {
  console.log('Attempting to fetch comment by ID');
  const { commentId } = req.params;

  Comment.findById(commentId)
  .then((comment) => {
      if (!comment) {
          return res.status(404).json({ message: 'Comment not found' });
      }
      res.status(200).json(comment);
  })
  .catch((err) => {

      res.status(500).json({ message: 'Error fetching comment', error: err.message });
  });
};

const updateComment = (req, res) => {
  console.log('Attempting to update comment');
  const { commentId } = req.params;
  const { content, owner } = req.body;

  if (!content || !owner) {
      return res.status(400).json({ message: 'Content and owner are required' });
  }

  Comment.findByIdAndUpdate(commentId, { content, owner }, { new: true, runValidators: true })
      .then((updatedComment) => {
          if (!updatedComment) {
              return res.status(404).json({ message: 'Comment not found' });
          }
          res.status(200).json(updatedComment);
      })
      .catch((err) => res.status(500).json({ message: 'Error updating comment', error: err.message }));
};

const deleteComment = async (req, res) => {
  console.log('Attempting to delete comment');
  const { commentId } = req.params;

  try {
    console.log('Attempting to delete comment:', commentId);
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    console.log('Manual find result:', Comment);

    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err); 
    return res.status(500).json({ message: 'Failed to delete comment', error: err.message});
}
};

module.exports = { createComment, getAllComments, getCommentsByPost, getCommentById, updateComment, deleteComment};

