import express, { Request, Response } from "express";
const router = express.Router();
import PostControllers from '../controllers/PostControllers';
import { authMiddleware } from '../controllers/AuthControllers';
import { upload } from '../middlewares/uploadMiddleware';

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Endpoints for handling posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - owner
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         owner:
 *           type: string
 *           description: The owner (user) who created the post
 *       example:
 *         title: "My first post"
 *         content: "This is the content of the post."
 *         owner: "60d21b4667d0d8992e610c85"
 */

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
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing or invalid data
 *       403:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, (req: Request, res: Response) => {
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: No posts found
 */
router.get("/all", PostControllers.getAll.bind(PostControllers));

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
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated title of the post
 *               content:
 *                 type: string
 *                 description: Updated content of the post
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing or invalid data
 *       404:
 *         description: Post not found or could not be updated
 *       403:
 *         description: Unauthorized
 */
router.put("/:_id", authMiddleware, PostControllers.updatePost.bind(PostControllers));


router.post("/", authMiddleware, upload.single("image"), (req: Request, res: Response) => {
  PostControllers.create(req, res);
});

export default router;
