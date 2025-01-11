import express from 'express';
const router = express.Router();
import PostControllers from '../controllers/PostControllers';

router.post('/', PostControllers.addPost);
router.get('/filter/bySender', PostControllers.getPostsBySender);
router.get('/all', PostControllers.getAllPosts);
router.get('/:id', PostControllers.getPostById);
router.put('/:id', PostControllers.updatePost);
router.delete('/delete/:id', PostControllers.deletePost);
export default router;