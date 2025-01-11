"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommentModel_1 = __importDefault(require("../models/CommentModel"));
const PostModel_1 = __importDefault(require("../models/PostModel"));
const createComment = async (req, res) => {
    console.log('Attempting to create comment');
    const { content, postId, owner } = req.body;
    if (!content || !postId || !owner) {
        res.status(400).json({ message: 'Content, postId, and owner are required' });
        return;
    }
    try {
        const postExists = await PostModel_1.default.findById(postId);
        if (!postExists) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const newComment = new CommentModel_1.default({ content, postId, owner });
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating comment', error: String(error) });
        return;
    }
};
const getAllComments = (req, res) => {
    console.log('Attempting to fetch all comments');
    CommentModel_1.default.find()
        .then((comments) => res.status(200).json(comments))
        .catch((error) => {
        res.status(500).json({ message: 'Error fetching comments', error: String(error) });
    });
};
const getCommentsByPost = (req, res) => {
    console.log('Attempting to fetch comments by post');
    const { postId } = req.params;
    CommentModel_1.default.find({ postId })
        .then((comments) => res.status(200).json(comments))
        .catch((error) => {
        res.status(500).json({ message: 'Error fetching comments for post', error: String(error) });
    });
};
const getCommentById = (req, res) => {
    console.log('Attempting to fetch comment by ID');
    const { commentId } = req.params;
    CommentModel_1.default.findById(commentId)
        .then((comment) => {
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    })
        .catch((error) => {
        res.status(500).json({ message: 'Error fetching comment', error: String(error) });
    });
};
const updateComment = (req, res) => {
    console.log('Attempting to update comment');
    const { commentId } = req.params;
    const { content, owner } = req.body;
    if (!content || !owner) {
        res.status(400).json({ message: 'Content and owner are required' });
        return;
    }
    CommentModel_1.default.findByIdAndUpdate(commentId, { content, owner }, { new: true, runValidators: true })
        .then((updatedComment) => {
        if (!updatedComment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        res.status(200).json(updatedComment);
    })
        .catch((error) => {
        res.status(500).json({ message: 'Error updating comment', error: String(error) });
    });
};
const deleteComment = async (req, res) => {
    console.log('Attempting to delete comment');
    const { commentId } = req.params;
    try {
        const deletedComment = await CommentModel_1.default.findByIdAndDelete(commentId);
        if (!deletedComment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete comment', error: String(error) });
        return;
    }
};
const deleteAllComments = async (req, res) => {
    try {
        await CommentModel_1.default.deleteMany({});
        res.status(200).json({ message: 'All comments deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting all comments', error: String(error) });
    }
};
exports.default = { createComment, getAllComments, getCommentsByPost, getCommentById, updateComment, deleteComment, deleteAllComments };
