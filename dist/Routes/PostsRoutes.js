"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const PostControllers_1 = __importDefault(require("../controllers/PostControllers"));
const AuthControllers_1 = require("../controllers/AuthControllers");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
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
router.post("/", AuthControllers_1.authMiddleware, (req, res) => {
    PostControllers_1.default.create(req, res);
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
router.get("/all", PostControllers_1.default.getAll.bind(PostControllers_1.default));
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
router.get("/:_id", (req, res) => {
    PostControllers_1.default.getById(req, res);
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
router.put("/:_id", AuthControllers_1.authMiddleware, PostControllers_1.default.updatePost.bind(PostControllers_1.default));
router.post("/", AuthControllers_1.authMiddleware, uploadMiddleware_1.upload.single("image"), (req, res) => {
    PostControllers_1.default.create(req, res);
});
exports.default = router;
