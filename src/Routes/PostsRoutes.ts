import express, { Request, Response } from "express";
const router = express.Router();
import PostControllers from '../controllers/PostControllers';


router.post("/", (req: Request, res: Response) => {
    PostControllers.create(req, res);});

router.get("/all", PostControllers.getAll.bind(PostControllers));

router.get("/:_id", (req: Request, res: Response) => {
    PostControllers.getById(req, res);});

router.put("/:_id",PostControllers.updatePost.bind(PostControllers));


// router.get('/filter/bySender', PostControllers.getPostsBySender);


export default router;