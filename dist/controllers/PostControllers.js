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
        var _a, _b, _c, _d, _e;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
            const userUsername = (_c = req.user) === null || _c === void 0 ? void 0 : _c.username;
            const userProfileImage = (_d = req.user) === null || _d === void 0 ? void 0 : _d.profileImage;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const image = (_e = req.file) === null || _e === void 0 ? void 0 : _e.path;
            if (!req.body.title || !req.body.content) {
                res.status(400).json({ message: "Missing required fields" });
                return;
            }
            req.body.email = userEmail;
            req.body.username = userUsername;
            req.body.userProfileImage = userProfileImage;
            req.body.owner = userId;
            req.body.image = image;
            req.body.comments = [];
            console.log(req.body);
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
    async deletePost(req, res) {
        try {
            const post = await PostModel_1.default.findById(req.params.id);
            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }
            if (post.owner.toString() !== req.user._id.toString()) {
                res.status(403).json({ message: "You are not authorized to delete this post" });
                return;
            }
            await post.deleteOne();
            res.status(200).json({ message: "Post deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting post", error });
        }
    }
}
exports.default = new PostController();
