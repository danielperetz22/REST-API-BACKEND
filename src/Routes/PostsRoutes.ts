import express, { Request, Response } from "express";
const router = express.Router();
import PostControllers from '../controllers/PostControllers';
import { authMiddleware } from '../controllers/AuthControllers';

router.post("/", authMiddleware , (req: Request, res: Response) => {
    PostControllers.create(req, res);});

router.get("/all", PostControllers.getAll.bind(PostControllers));

router.get("/:_id", (req: Request, res: Response) => {
    PostControllers.getById(req, res);});

router.put("/:_id",authMiddleware,PostControllers.updatePost.bind(PostControllers));



export default router;