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
        const newtitle = req.body.title;
        const newContent = req.body.content;
        try {
            const postToUpdate = await PostModel_1.default.findByIdAndUpdate(askerID, { title: newtitle, content: newContent }, { new: true });
            if (!newtitle || !newContent) {
                res.status(400).send("Missing Data");
                return;
            }
            if (!postToUpdate) {
                res.status(404).send("could not find post");
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
        var _a, _b;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
        if (!userId || !image) {
            res.status(400).send("Unauthorized or missing image");
            return;
        }
        const post = {
            title: req.body.title,
            content: req.body.content,
            owner: userId,
            image,
        };
        if (!post.owner || !post.content || !post.title || !post.image) {
            res.status(400).send("Missing Data");
            return;
        }
        req.body = post;
        return super.create(req, res);
    }
}
exports.default = new PostController(PostModel_1.default);
