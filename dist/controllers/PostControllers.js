"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseController_1 = require("./baseController");
const PostModel_1 = __importDefault(require("../models/PostModel"));
const CommentModel_1 = __importDefault(require("../models/CommentModel"));
class PostController extends baseController_1.BaseController {
    constructor() {
        super(PostModel_1.default);
    }
    async updatePost(req, res) {
        try {
            const { title, content } = req.body;
            if (!title || !content) {
                res.status(400).json({ message: "Missing data" });
                return;
            }
            const postToUpdate = await PostModel_1.default.findByIdAndUpdate(req.params._id, { title, content }, { new: true });
            if (!postToUpdate) {
                res.status(404).json({ message: "Post not found" });
                return;
            }
            res.status(200).json(postToUpdate);
        }
        catch (error) {
            res.status(500).json({ message: "Error updating post", error });
        }
    }
    async create(req, res) {
        var _a, _b, _c;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // from authMiddleware
            const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email; // from authMiddleware
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const image = (_c = req.file) === null || _c === void 0 ? void 0 : _c.path;
            if (!req.body.title || !req.body.content) {
                res.status(400).json({ message: "Missing required fields" });
                return;
            }
            req.body.email = userEmail;
            req.body.owner = userId;
            req.body.image = image;
            req.body.comments = [];
            await super.create(req, res);
        }
        catch (error) {
            console.error("Error in create:", error);
            res.status(500).json({ message: "Error creating post", error });
        }
    }
    async getAll(req, res) {
        try {
            const posts = await PostModel_1.default.find();
            const postsWithComments = await Promise.all(posts.map(async (post) => {
                const comments = await CommentModel_1.default.find({ postId: post._id });
                return Object.assign(Object.assign({}, post.toObject()), { comments });
            }));
            res.status(200).json(postsWithComments);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching posts", error });
        }
    }
}
exports.default = new PostController();
