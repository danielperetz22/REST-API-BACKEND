"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getPostsBySender = exports.getPostById = exports.getAllPosts = exports.addPost = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PostModel_1 = __importDefault(require("../models/PostModel"));
const addPost = async (req, res) => {
    const { title, content, senderId } = req.body;
    if (!title || !content || !senderId) {
        res.status(400).json({ message: 'Missing required fields: title, content, and senderId are required' });
        return;
    }
    try {
        const post = new PostModel_1.default(req.body);
        await post.save();
        res.status(201).json({ post });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding post', error: String(error) });
    }
};
exports.addPost = addPost;
const getAllPosts = async (_req, res) => {
    try {
        const posts = await PostModel_1.default.find();
        res.status(200).json({ posts });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: String(error) });
    }
};
exports.getAllPosts = getAllPosts;
const getPostById = async (req, res) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: 'Invalid post ID format' });
        return;
    }
    try {
        const post = await PostModel_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: `Post with ID ${req.params.id} not found` });
            return;
        }
        res.status(200).json({ post });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching post', error: String(error) });
    }
};
exports.getPostById = getPostById;
const getPostsBySender = async (req, res) => {
    const { senderId } = req.query;
    if (!senderId) {
        res.status(400).json({ message: 'Sender ID is required' });
        return;
    }
    try {
        const posts = await PostModel_1.default.find({ senderId });
        if (!posts.length) {
            res.status(404).json({ message: `No posts found for sender ID ${senderId}` });
            return;
        }
        res.status(200).json({ posts });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: String(error) });
    }
};
exports.getPostsBySender = getPostsBySender;
const updatePost = async (req, res) => {
    const { id } = req.params;
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ message: "Request body cannot be empty" });
        return;
    }
    try {
        const existingPost = await PostModel_1.default.findById(id);
        if (!existingPost) {
            res.status(404).json({ message: `Post with ID ${id} not found` });
            return;
        }
        const updatedPost = await PostModel_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        res.status(200).json({ post: updatedPost });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating posts', error: String(error) });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    const { id } = req.params;
    console.log("DELETE request received with ID:", id);
    try {
        const deletedPost = await PostModel_1.default.findByIdAndDelete(id);
        console.log("Deleted post:", deletedPost);
        if (!deletedPost) {
            res.status(404).json({ message: `Post with ID ${id} not found` });
            return;
        }
        res.status(200).json({ message: "Post deleted successfully", post: deletedPost });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: String(error) });
    }
};
exports.deletePost = deletePost;
exports.default = { addPost: exports.addPost, getAllPosts: exports.getAllPosts, getPostById: exports.getPostById, getPostsBySender: exports.getPostsBySender, updatePost: exports.updatePost, deletePost: exports.deletePost };
