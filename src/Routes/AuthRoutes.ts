import express from 'express';
const router = express.Router();
import AuthControllers from '../controllers/AuthControllers';

router.post('/register', AuthControllers.register);
router.post('/login', AuthControllers.login);
router.post('/logout', AuthControllers.logout); 
router.post('/refresh', AuthControllers.refresh); 

export default router;
