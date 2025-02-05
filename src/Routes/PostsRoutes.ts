import express, { Request, Response } from "express";
const router = express.Router();
import PostControllers from "../controllers/PostControllers";
import { authMiddleware } from "../controllers/AuthControllers";
import { upload } from "../middlewares/uploadMiddleware";

/**
 * @swagger
 * /post:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Create a new post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Missing or invalid data
 *       403:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, upload.single("image"), (req: Request, res: Response) => {
  PostControllers.create(req, res);
});

/**
 * @swagger
 * /post/all:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get all posts
 *     responses:
 *       200:
 *         description: List of posts
 *       404:
 *         description: No posts found
 */
router.get("/all", (req: Request, res: Response) => {
  PostControllers.getAll(req, res);
});

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get a post by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 */
router.get("/:_id", (req: Request, res: Response) => {
  PostControllers.getById(req, res);
});

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Update a post by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Missing or invalid data
 *       404:
 *         description: Post not found
 */
router.put("/:_id", authMiddleware, (req: Request, res: Response) => {
  PostControllers.updatePost(req, res);
});

export default router;
