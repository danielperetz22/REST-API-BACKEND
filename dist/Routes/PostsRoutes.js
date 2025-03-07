"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PostControllers_1 = __importDefault(require("../controllers/PostControllers"));
const AuthControllers_1 = require("../controllers/AuthControllers");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Endpoints for managing posts
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         owner:
 *           type: string
 *           description: ID of the user who created the post
 *         image:
 *           type: string
 *           description: Image URL associated with the post
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         title: "Sample Post"
 *         content: "This is a sample post content."
 *         owner: "60d21b5267d0d8992e610c88"
 *         image: "https://example.com/sample.jpg"
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing or invalid data
 *       401:
 *         description: Unauthorized
 */
router.post("/", AuthControllers_1.authMiddleware, uploadMiddleware_1.upload.single("image"), (req, res) => {
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
router.get("/all", (req, res) => {
    PostControllers_1.default.getAll(req, res);
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Post not found
 */
router.get("/:id", (req, res) => {
    PostControllers_1.default.getPostById(req, res);
});
/**
 * @swagger
 * /post/{id}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Update a post by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Unauthorized (not the owner)
 *       404:
 *         description: Post not found
 */
router.put("/:id", AuthControllers_1.authMiddleware, (req, res) => {
    PostControllers_1.default.updatePost(req, res);
});
/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Delete a post by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Unauthorized (not the owner)
 *       404:
 *         description: Post not found
 */
router.delete("/:id", AuthControllers_1.authMiddleware, (req, res) => {
    PostControllers_1.default.deletePost(req, res);
});
exports.default = router;
//# sourceMappingURL=PostsRoutes.js.map