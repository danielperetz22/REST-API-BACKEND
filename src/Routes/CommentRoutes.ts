import express from 'express';
const router = express.Router();
import CommentControllers from '../controllers/CommentControllers';



router.post('/', CommentControllers.createComment);
router.get('/all', CommentControllers.getAllComments);
router.get('/post/:postId', CommentControllers.getCommentsByPost);
router.get('/:commentId', CommentControllers.getCommentById);
router.put('/update/:commentId', CommentControllers.updateComment);
// router.delete('/:commentId', (req, res, next) => 
//     CommentControllers.deleteComment(req, res).catch(next));
router.delete('/delete/:commentId', CommentControllers.deleteComment);
router.delete('/delete/all', CommentControllers.deleteAllComments);

export default router;