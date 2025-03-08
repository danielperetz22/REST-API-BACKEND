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
const baseController_1 = require("./baseController");
const PostModel_1 = __importDefault(require("../models/PostModel"));
const CommentModel_1 = __importDefault(require("../models/CommentModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class PostController extends baseController_1.BaseController {
    constructor() {
        super(PostModel_1.default);
    }
    updatePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, content } = req.body;
                if (!title || !content) {
                    res.status(400).json({ message: "Missing data" });
                    return;
                }
                const postToUpdate = yield PostModel_1.default.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
                if (!postToUpdate) {
                    res.status(404).json({ message: "Post not found" });
                    return;
                }
                res.status(200).json(postToUpdate);
            }
            catch (error) {
                res.status(500).json({ message: "Error updating post", error });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                console.log("📩 Incoming request:", req.body);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized: User not authenticated" });
                    return;
                }
                const { title, content } = req.body;
                if (!title || !content) {
                    res.status(400).json({ message: "Missing required fields: title and content" });
                    return;
                }
                const userEmail = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.email) || "unknown@example.com";
                const userUsername = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.username) || "Anonymous";
                const userProfileImage = ((_d = req.user) === null || _d === void 0 ? void 0 : _d.profileImage) || "https://example.com/default-avatar.jpg";
                const imagePath = req.file ? `uploads/${req.file.filename}` : "https://example.com/default-image.jpg";
                const newPost = new PostModel_1.default({
                    title,
                    content,
                    email: userEmail,
                    username: userUsername,
                    userProfileImage: userProfileImage,
                    owner: userId,
                    image: imagePath,
                    comments: []
                });
                const savedPost = yield newPost.save();
                console.log("✅ Post successfully created:", savedPost);
                res.status(201).json(savedPost);
            }
            catch (error) {
                console.error("❌ Error creating post:", error);
                res.status(500).json({ message: "Error creating post", error });
            }
        });
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const posts = yield PostModel_1.default.find();
                const postsWithComments = yield Promise.all(posts.map((post) => __awaiter(this, void 0, void 0, function* () {
                    const comments = yield CommentModel_1.default.find({ postId: post._id });
                    return Object.assign(Object.assign({}, post.toObject()), { comments });
                })));
                res.status(200).json(postsWithComments);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching posts", error });
            }
        });
    }
    deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield PostModel_1.default.findById(req.params.id);
                if (!post) {
                    res.status(404).json({ message: "Post not found" });
                    return;
                }
                if (post.owner.toString() !== req.user._id.toString()) {
                    res.status(403).json({ message: "You are not authorized to delete this post" });
                    return;
                }
                yield post.deleteOne();
                res.status(200).json({ message: "Post deleted successfully" });
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting post", error });
            }
        });
    }
    getPostById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ message: "Invalid post ID format" });
                    return;
                }
                const post = yield PostModel_1.default.findById(id);
                if (!post) {
                    res.status(404).json({ message: "Post not found" });
                    return;
                }
                res.status(200).json(post);
            }
            catch (error) {
                res.status(500).json({ message: "Error retrieving post", error });
            }
        });
    }
}
exports.default = new PostController();
//# sourceMappingURL=PostControllers.js.map