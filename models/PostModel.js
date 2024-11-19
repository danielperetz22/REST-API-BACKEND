const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  senderId: String,
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);