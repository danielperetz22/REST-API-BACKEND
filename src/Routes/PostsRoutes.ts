import express from 'express';
const router = express.Router();
import PostControllers from '../controllers/PostControllers';

router.post('/', PostControllers.addPost);
router.get('/filter/bySender', PostControllers.getPostsBySender);
router.get('/all', PostControllers.getAllPosts);
router.get('/:id', PostControllers.getPostById);
router.put('/:id', PostControllers.updatePost);

router.post('/', (req, res, next) => {
    console.log('Request reached POST /');
    next();
});

export default router;