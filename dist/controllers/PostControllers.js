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
exports.updatePost = exports.getPostsBySender = exports.getPostById = exports.getAllPosts = exports.addPost = void 0;
const PostModel_1 = __importDefault(require("../models/PostModel"));
const addPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, senderId } = req.body;
    console.log('Received POST request with data:', req.body);
    if (!title || !content || !senderId) {
        return res.status(400).json({
            message: 'Missing required fields: title, content, and senderId are required',
        });
    }
    try {
        const post = new PostModel_1.default(req.body);
        yield post.save();
        return res.status(201).json({
            message: 'Post added successfully',
            post: post,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error adding post:', errorMessage);
        return res.status(500).json({
            message: 'An error occurred while adding the post',
            error: errorMessage,
        });
    }
});
exports.addPost = addPost;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield PostModel_1.default.find();
        return res.status(200).json({
            message: 'Posts fetched successfully',
            posts: posts,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error fetching posts:', errorMessage);
        return res.status(500).json({
            message: 'An error occurred while fetching the posts',
            error: errorMessage,
        });
    }
});
exports.getAllPosts = getAllPosts;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    try {
        const post = yield PostModel_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: `Post with ID ${postId} not found`,
            });
        }
        return res.status(200).json({
            message: 'Post fetched successfully',
            post: post,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Error fetching post with ID ${postId}:`, errorMessage);
        return res.status(500).json({
            message: 'An error occurred while fetching the post',
            error: errorMessage,
        });
    }
});
exports.getPostById = getPostById;
const getPostsBySender = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = req.query.senderId;
    if (!senderId) {
        return res.status(400).json({
            message: 'Sender ID is required',
        });
    }
    try {
        const posts = yield PostModel_1.default.find({ senderId });
        if (posts.length === 0) {
            return res.status(404).json({
                message: `No posts found for sender ID ${senderId}`,
            });
        }
        return res.status(200).json({
            message: 'Posts fetched successfully',
            posts: posts,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Error fetching posts for sender ID ${senderId}:`, errorMessage);
        return res.status(500).json({
            message: 'An error occurred while fetching the posts',
            error: errorMessage,
        });
    }
});
exports.getPostsBySender = getPostsBySender;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const post = yield PostModel_1.default.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: `Post with ID ${postId} not found`,
            });
        }
        const updatedPost = yield PostModel_1.default.findByIdAndUpdate(postId, updatePost, {
            new: true,
            runValidators: true,
        });
        return res.status(200).json({
            message: 'Post updated successfully',
            post: updatedPost,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Error updating post with ID ${postId}:`, errorMessage);
        return res.status(500).json({
            message: 'An error occurred while updating the post',
            error: errorMessage,
        });
    }
});
exports.updatePost = updatePost;
exports.default = { addPost: exports.addPost, getAllPosts: exports.getAllPosts, getPostById: exports.getPostById, getPostsBySender: exports.getPostsBySender, updatePost: exports.updatePost };
//# sourceMappingURL=PostControllers.js.map