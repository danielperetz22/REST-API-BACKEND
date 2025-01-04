import AuthControllers from "../controllers/AuthControllers";
import express , { Request, Response } from "express";
const router = express.Router();


router.post("/register",(req :Request , res : Response) => {
    AuthControllers.register(req , res);
}); 
router.post("/register",(req :Request , res : Response) => {
    AuthControllers.login(req , res);
}); 
export default router;