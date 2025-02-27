import express, { Request, Response } from 'express';
import CommentControllers from '../controllers/CommentControllers';
import { authMiddleware } from '../controllers/AuthControllers';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Endpoints for handling comments on posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - postId
 *         - owner
 *       properties:
 *         content:
 *           type: string
 *           description: The comment's text content
 *         postId:
 *           type: string
 *           description: The ID of the post the comment belongs to
 *         owner:
 *           type: string
 *           description: The owner of the comment
 *       example:
 *         content: "This is a comment"
 *         postId: "60d21b4667d0d8992e610c85"
 *         owner: "60d21b5267d0d8992e610c88"
 */

/**
 * @swagger
 * /comment:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments or comments by post ID
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: Filter comments by post ID
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: No comments found
 */
router.get("/", (req: Request, res: Response) => {
  const postId = req.query.postId;
  if (!postId) {
    CommentControllers.getAll(req, res);
  } else {
    CommentControllers.gatAllCommentsByPostId(req, res);
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get a comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Comment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */
router.get("/:_id", (req: Request, res: Response) => {
  CommentControllers.getById(req, res);
});

/**
 * @swagger
 * /comment:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Missing or invalid data
 */
router.post("/", authMiddleware, (req: Request, res: Response) => {
  CommentControllers.create(req, res);
});

/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated content of the comment
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found or could not be updated
 */
router.put("/:_id", CommentControllers.updateComment.bind(CommentControllers));

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found or could not be deleted
 */
router.delete("/:_id", (req: Request, res: Response) => {
  CommentControllers.deleteComment(req, res);
});

router.post("/", (req: Request, res: Response) => {
  CommentControllers.create(req, res);
});

export default router;
