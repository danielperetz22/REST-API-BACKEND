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
router.put("/:_id", AuthControllers_1.authMiddleware, (req, res) => {
    PostControllers_1.default.updatePost(req, res);
});
exports.default = router;
