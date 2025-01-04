"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommentModel_1 = __importDefault(require("../models/CommentModel"));
const PostModel_1 = __importDefault(require("../models/PostModel"));
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Attempting to create comment');
    const { content, postId, owner } = req.body;
    if (!content || !postId || !owner) {
        return res.status(400).json({ message: 'Content, postId, and owner are required' });
    }
    try {
        const postExists = yield PostModel_1.default.findById(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const newComment = new CommentModel_1.default({ content, postId, owner });
        const savedComment = yield newComment.save();
        return res.status(201).json(savedComment);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error creating comment:', errorMessage);
        return res.status(500).json({ message: 'Error creating comment', error: errorMessage });
    }
});
const getAllComments = (req, res) => {
    console.log('Attempting to fetch all comments');
    CommentModel_1.default.find()
        .then((comments) => res.status(200).json(comments))
        .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(500).json({ message: 'Error fetching comments', error: errorMessage });
    });
};
const getCommentsByPost = (req, res) => {
    console.log('Attempting to fetch comments by post');
    const { postId } = req.params;
    CommentModel_1.default.find({ postId })
        .then((comments) => res.status(200).json(comments))
        .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(500).json({ message: 'Error fetching comments for post', error: errorMessage });
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
        .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(500).json({ message: 'Error fetching comment', error: errorMessage });
    });
};
const updateComment = (req, res) => {
    console.log('Attempting to update comment');
    const { commentId } = req.params;
    const { content, owner } = req.body;
    if (!content || !owner) {
        return res.status(400).json({ message: 'Content and owner are required' });
    }
    CommentModel_1.default.findByIdAndUpdate(commentId, { content, owner }, { new: true, runValidators: true })
        .then((updatedComment) => {
        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(updatedComment);
    })
        .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        res.status(500).json({ message: 'Error updating comment', error: errorMessage });
    });
};
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Attempting to delete comment');
    const { commentId } = req.params;
    try {
        const deletedComment = yield CommentModel_1.default.findByIdAndDelete(commentId);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        return res.status(200).json({ message: 'Comment deleted successfully' });
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error deleting comment:', errorMessage);
        return res.status(500).json({ message: 'Failed to delete comment', error: errorMessage });
    }
});
exports.default = { createComment, getAllComments, getCommentsByPost, getCommentById, updateComment, deleteComment };
//# sourceMappingURL=CommentControllers.js.map