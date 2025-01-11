"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const CommentControllers_1 = __importDefault(require("../controllers/CommentControllers"));
router.post('/', CommentControllers_1.default.createComment);
router.get('/all', CommentControllers_1.default.getAllComments);
router.get('/post/:postId', CommentControllers_1.default.getCommentsByPost);
router.get('/:commentId', CommentControllers_1.default.getCommentById);
router.put('/update/:commentId', CommentControllers_1.default.updateComment);
// router.delete('/:commentId', (req, res, next) => 
//     CommentControllers.deleteComment(req, res).catch(next));
router.delete('/delete/:commentId', CommentControllers_1.default.deleteComment);
router.delete('/delete/all', CommentControllers_1.default.deleteAllComments);
exports.default = router;
