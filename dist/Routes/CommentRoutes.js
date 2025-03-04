"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CommentControllers_1 = __importDefault(require("../controllers/CommentControllers"));
const AuthControllers_1 = require("../controllers/AuthControllers");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Endpoints for handling comments on posts
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
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - postId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the comment
 *         content:
 *           type: string
 *           description: The comment's text content
 *         postId:
 *           type: string
 *           description: The ID of the post the comment belongs to
 *         owner:
 *           type: string
 *           description: The user ID of the owner who created the comment
 *         email:
 *           type: string
 *           description: The email of the owner
 *         username:
 *           type: string
 *           description: The username of the owner
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         content: "This is a comment"
 *         postId: "60d21b4667d0d8992e610c85"
 *         owner: "60d21b5267d0d8992e610c88"
 *         email: "owner@example.com"
 *         username: "OwnerUserName"
 */
/**
 * @swagger
 * /comment:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments or filter by post ID
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         description: The ID of the post to filter comments by
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get("/", (req, res) => {
    const postId = req.query.postId;
    if (!postId) {
        CommentControllers_1.default.getAll(req, res);
    }
    else {
        CommentControllers_1.default.gatAllCommentsByPostId(req, res);
    }
});
/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get a comment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Comment not found
 */
router.get("/:id", (req, res) => {
    CommentControllers_1.default.getCommentById(req, res);
});
/**
 * @swagger
 * /comment:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               postId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 message:
 *                   type: string
 *                 newComment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Missing or invalid data
 *       401:
 *         description: Unauthorized (token missing or invalid)
 */
router.post("/", AuthControllers_1.authMiddleware, (req, res) => {
    CommentControllers_1.default.create(req, res);
});
/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment by ID
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
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Unauthorized (not the owner)
 *       404:
 *         description: Comment not found
 */
router.put("/:id", AuthControllers_1.authMiddleware, (req, res) => {
    CommentControllers_1.default.updateComment(req, res);
});
/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment by ID
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
 *         description: Comment deleted successfully
 *       403:
 *         description: Unauthorized (not the owner)
 *       404:
 *         description: Comment not found
 */
router.delete("/:id", AuthControllers_1.authMiddleware, (req, res) => {
    CommentControllers_1.default.deleteComment(req, res);
});
exports.default = router;
