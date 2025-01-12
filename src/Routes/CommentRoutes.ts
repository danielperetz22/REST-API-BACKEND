import express , {Request,Response} from 'express';
import CommentControllers from '../controllers/CommentControllers';
import { post } from 'jquery';

const router = express.Router();


router.get("/", (req: Request, res: Response) => {
    const postId = req.query.postId;
    if (!postId) {
        CommentControllers.getAll(req, res);
    } else {
        CommentControllers.gatAllCommentsByPostId(req, res);
    }});

router.get("/:_id", (req: Request, res: Response) => {
    CommentControllers.getById(req, res); });

router.post("/", (req: Request, res: Response) => {
    CommentControllers.create(req, res);
});

router.put("/:_id",CommentControllers.updateComment.bind(CommentControllers));

router.delete("/:_id", (req: Request, res: Response) => {
    CommentControllers.deleteComment(req, res);
});



export default router;