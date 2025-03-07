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
const baseController_1 = require("./baseController");
const AuthModel_1 = __importDefault(require("../models/AuthModel"));
const mongoose_1 = __importDefault(require("mongoose"));
class CommentController extends baseController_1.BaseController {
    constructor() {
        super(CommentModel_1.default);
    }
    gatAllCommentsByPostId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postID = req.query.postId;
            try {
                const findAllComments = yield CommentModel_1.default.find({ postId: postID }).select("content owner email username");
                res.status(200).json(findAllComments);
            }
            catch (error) {
                res.status(500).json({ message: "Error retrieving comments", error });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { content, postId } = req.body;
                if (!req.user || !req.user._id) {
                    res.status(401).json({ message: "User not authenticated" });
                    return;
                }
                const user = yield AuthModel_1.default.findById(req.user._id);
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                if (!content || !postId) {
                    res.status(400).json({ message: "Content and postId are required" });
                    return;
                }
                const newComment = yield CommentModel_1.default.create({
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
        });
    }
    updateComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const commentID = req.params._id;
            const newContent = req.body.comment;
            try {
                const comment = yield CommentModel_1.default.findById(commentID);
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
                yield comment.save();
                res.status(200).json({ message: "Comment updated successfully", comment });
            }
            catch (error) {
                res.status(500).json({ message: "Error updating comment", error });
            }
        });
    }
    deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const commentID = req.params._id;
            try {
                const comment = yield CommentModel_1.default.findById(commentID);
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
                yield CommentModel_1.default.findByIdAndDelete(commentID);
                res.status(200).json({ message: "Comment deleted successfully" });
            }
            catch (error) {
                res.status(500).json({ message: "Error deleting comment", error });
            }
        });
    }
    getCommentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ message: "Invalid comment ID format" });
                    return;
                }
                const comment = yield CommentModel_1.default.findById(id);
                if (!comment) {
                    res.status(404).json({ message: "Comment not found" });
                    return;
                }
                res.status(200).json(comment);
            }
            catch (error) {
                res.status(500).json({ message: "Error retrieving comment", error });
            }
        });
    }
}
exports.default = new CommentController();
//# sourceMappingURL=CommentControllers.js.map