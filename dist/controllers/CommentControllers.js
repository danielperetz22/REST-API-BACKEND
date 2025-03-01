"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommentModel_1 = __importDefault(require("../models/CommentModel"));
const baseController_1 = require("./baseController");
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
class CommentController extends baseController_1.BaseController {
    constructor() {
        super(CommentModel_1.default);
    }
    async gatAllCommentsByPostId(req, res) {
        const postID = req.query.postId;
        try {
            const findAllComments = await CommentModel_1.default.find({ postId: postID }).select("content owner email username");
            res.status(200).json(findAllComments);
        }
        catch (error) {
            res.status(500).json({ message: "Error retrieving comments", error });
        }
    }
    async create(req, res) {
        try {
            const { content, postId } = req.body;
            if (!req.user || !req.user._id) {
                res.status(401).json({ message: "User not authenticated" });
                return;
            }
            const user = await AuthModel_1.default.findById(req.user._id);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            if (!content || !postId) {
                res.status(400).json({ message: "Content and postId are required" });
                return;
            }
            const newComment = await CommentModel_1.default.create({
                postId,
                owner: user._id,
                email: user.email,
                username: user.username,
                content,
            });
            res.status(201).json({ message: "Comment created successfully", newComment });
        }
        catch (error) {
            console.error("Error creating comment:", error);
            res.status(500).json({ message: "Internal server error", error });
        }
    }
    async updateComment(req, res) {
        var _a;
        const commentID = req.params._id;
        const newContent = req.body.comment;
        try {
            const comment = await CommentModel_1.default.findById(commentID);
            if (!comment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }
            console.log("Comment Owner:", comment.owner.toString());
            console.log("Request User ID:", (_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString());
            if (!req.user || !req.user._id) {
                res.status(401).json({ message: "User not authenticated" });
                return;
            }
            if (comment.owner.toString() !== req.user._id.toString()) {
                res.status(403).json({ message: "Unauthorized to edit this comment" });
                return;
            }
            comment.content = newContent;
            await comment.save();
            res.status(200).json({ message: "Comment updated successfully", comment });
        }
        catch (error) {
            res.status(500).json({ message: "Error updating comment", error });
        }
    }
    async deleteComment(req, res) {
        const commentID = req.params._id;
        try {
            const comment = await CommentModel_1.default.findById(commentID);
            if (!comment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }
            if (!req.user || !req.user._id) {
                res.status(401).json({ message: "User not authenticated" });
                return;
            }
            if (comment.owner.toString() !== req.user._id.toString()) {
                res.status(403).json({ message: "Unauthorized to delete this comment" });
                return;
            }
            await CommentModel_1.default.findByIdAndDelete(commentID);
            res.status(200).json({ message: "Comment deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting comment", error });
        }
    }
}
exports.default = new CommentController();
