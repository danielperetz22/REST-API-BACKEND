import express from 'express';
const router = express.Router();
import AuthControllers from '../controllers/AuthControllers';

router.post('/register', AuthControllers.register);
router.post('/login', AuthControllers.login);
router.get('/validate', AuthControllers.validateToken); 
// router.get('/protected', AuthControllers.AuthMiddleware, (req, res) => {
//   res.status(200).json({ message: 'You have access to the protected route!' });
// });
router.get('/protected', AuthControllers.AuthMiddleware);

export default router;
