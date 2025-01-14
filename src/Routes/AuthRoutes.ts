import express from 'express';
const router = express.Router();
import AuthControllers, {authMiddleware} from '../controllers/AuthControllers';

router.post('/register', AuthControllers.register);
router.post('/login', AuthControllers.login);
router.post('/logout', AuthControllers.logout); 
router.post('/refresh', AuthControllers.refresh); 

// test middleware
router.get("/testAuth", authMiddleware, (req, res) => {
    res.status(200).json({ message: "You are authenticated" });
  });
  

export default router;
