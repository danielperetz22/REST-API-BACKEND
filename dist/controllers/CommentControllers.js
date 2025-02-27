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
        console.log("GET ALL COMMENTS ON SPECIFIC POST METHOD");
        console.log(postID);
        try {
            const findAllComments = await CommentModel_1.default.find({ postId: postID }).select('content owner email and username');
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
        const commentID = req.params._id;
        const newContent = req.body.comment;
        try {
            const commentToUpdate = await CommentModel_1.default.findByIdAndUpdate(commentID, { content: newContent }, { new: true });
            if (!commentToUpdate) {
                res.status(404).send("COULD NOT UPDATE COMMENT DUE TO AN ERROR!");
                return;
            }
            else {
                res.status(200).send(commentToUpdate);
                return;
            }
        }
        catch (error) {
            res.status(400).send(error);
            return;
        }
    }
    async deleteComment(req, res) {
        const commentID = req.params._id;
        try {
            const theComment = await CommentModel_1.default.findByIdAndDelete({
                _id: commentID,
            });
            if (!theComment) {
                res.status(404).send("Could not delete comment due to an error");
                return;
            }
            else {
                res.status(200).send(theComment);
                return;
            }
        }
        catch (error) {
            res.status(400).send(error);
            return;
        }
    }
}
exports.default = new CommentController();
