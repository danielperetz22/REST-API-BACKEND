"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommentModel_1 = __importDefault(require("../models/CommentModel"));
const baseController_1 = require("./baseController");
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
    // async gatAllCommentsByPostId(req: Request, res: Response) {
    //   const postID = req.query.postId;
    //   console.log("GET ALL COMMENTS ON SPECIFIC POST METHOD");
    //   console.log(postID);
    //   try {
    //     const findAllComments = await Comment.find({ postId: postID });
    //     if (findAllComments.length === 0) {
    //       res.status(400).send("There are not comments on this post");
    //       return;
    //     } else {
    //       res.status(200).send(findAllComments);
    //       return;
    //     }
    //   } catch (error) {
    //     res.status(400).send(error);
    //   }
    // }
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
