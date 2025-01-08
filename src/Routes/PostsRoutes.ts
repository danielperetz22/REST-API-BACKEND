import express from 'express';
const router = express.Router();
import PostControllers from '../controllers/PostControllers';

router.post('/', PostControllers.addPost);
router.get('/bySender:?owner', PostControllers.getPostsBySender);
router.get('/all', PostControllers.getAllPosts);
router.get('/:id', PostControllers.getPostById);
router.put('/:id', PostControllers.updatePost);


export default router;