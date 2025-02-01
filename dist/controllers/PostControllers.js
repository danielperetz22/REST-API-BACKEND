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
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            if (!req.body.title || !req.body.content) {
                res.status(400).json({ message: "Missing required fields" });
                return;
            }
            req.body.owner = userId;
            req.body.image = image;
            await super.create(req, res);
        }
        catch (error) {
            res.status(500).json({ message: "Error creating post", error });
        }
    }
}
exports.default = new PostController(PostModel_1.default);
