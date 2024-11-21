const express = require ('express');
const router = express.Router();
const PostControllers = require('../controllers/PostControllers');

router.post('/', PostControllers.addPost);
router.get('/', PostControllers.getAllPosts);
router.get('/:id', PostControllers.getPostById);
router.get('/sender/:senderId', PostControllers.getPostsBySender);

module.exports = router;