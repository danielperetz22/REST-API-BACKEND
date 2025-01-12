"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CommentControllers_1 = __importDefault(require("../controllers/CommentControllers"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    const postId = req.query.postId;
    if (!postId) {
        CommentControllers_1.default.getAll(req, res);
    }
    else {
        CommentControllers_1.default.gatAllCommentsByPostId(req, res);
    }
});
router.get("/:_id", (req, res) => {
    CommentControllers_1.default.getById(req, res);
});
router.post("/", (req, res) => {
    CommentControllers_1.default.create(req, res);
});
router.put("/:_id", CommentControllers_1.default.updateComment.bind(CommentControllers_1.default));
router.delete("/:_id", (req, res) => {
    CommentControllers_1.default.deleteComment(req, res);
});
exports.default = router;
