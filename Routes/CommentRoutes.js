const express = require ('express');
const router = express.Router();
const CommentControllers = require('../controllers/CommentControllers');



router.post('/', CommentControllers.createComment);
router.get('/all', CommentControllers.getAllComments);
router.get('/post/:postId', CommentControllers.getCommentsByPost);
router.get('/:commentId', CommentControllers.getCommentById);
router.put('/:commentId', CommentControllers.updateComment);
router.delete('/:commentId', CommentControllers.deleteComment);

module.exports = router;
