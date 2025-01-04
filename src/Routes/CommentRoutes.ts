import express from 'express';
const router = express.Router();
import CommentControllers from '../controllers/CommentControllers';



router.post('/', CommentControllers.createComment);
router.get('/all', CommentControllers.getAllComments);
router.get('/post/:postId', CommentControllers.getCommentsByPost);
router.get('/:commentId', CommentControllers.getCommentById);
router.put('/:commentId', CommentControllers.updateComment);
router.delete('/:commentId', CommentControllers.deleteComment);

export default router;