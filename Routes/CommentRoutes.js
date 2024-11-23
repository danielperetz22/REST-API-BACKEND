const express = require ('express');
const router = express.Router();
const CommentControllers = require('../controllers/CommentControllers');

router.post('/', CommentControllers.createComment);
router.get('/all', CommentControllers.getAllComments);
router.get('/byPost/:postId', CommentControllers.getCommentsByPost);
router.put('/:id', CommentControllers.updateComment);
router.delete('/:id', CommentControllers.deleteComment);

module.exports = router;