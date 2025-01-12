"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseController_1 = require("./baseController");
const PostModel_1 = __importDefault(require("../models/PostModel"));
class PostController extends baseController_1.BaseController {
    constructor(model) {
        super(model);
    }
    async updatePost(req, res) {
        const askerID = req.params._id;
        const newContent = req.body.content;
        try {
            const postToUpdate = await PostModel_1.default.findByIdAndUpdate(askerID, { content: newContent }, { new: true });
            if (!postToUpdate) {
                res.status(404).send("COULDNT FIND POST! DUE TO AN ERROR");
                return;
            }
            else {
                res.status(200).send(postToUpdate);
                return;
            }
        }
        catch (error) {
            res.status(400).send(error);
            return;
        }
    }
    async create(req, res) {
        const userId = req.query.userId;
        if (!userId) {
            res.status(403).send("Unauthorized");
            return;
        }
        const post = {
            title: req.body.title,
            content: req.body.content,
            owner: userId
        };
        if (!post.owner || !post.content || !post.title) {
            res.status(400).send("Missing Data");
            return;
        }
        req.body = post;
        return super.create(req, res);
    }
}
exports.default = new PostController(PostModel_1.default);
