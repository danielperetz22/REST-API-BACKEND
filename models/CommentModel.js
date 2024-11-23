const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  owner: {
    type: String,
    required: true,
  }
}, { timestamps: true }); 

module.exports = mongoose.model('Comment', commentSchema);

