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
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - postId
 *       properties:
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
 *     summary: Get all comments or comments by post ID
 *     description: |
 *       If `postId` query param is provided, returns comments for that post.
 *       Otherwise, returns all comments in the system.
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
router.get("/", (req, res) => {
    const postId = req.query.postId;
    if (!postId) {
        // Get all comments
        CommentControllers_1.default.getAll(req, res);
    }
    else {
        // Get all comments by post ID
        CommentControllers_1.default.gatAllCommentsByPostId(req, res);
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
router.get("/:_id", (req, res) => {
    CommentControllers_1.default.getById(req, res);
});
/**
 * @swagger
 * /comment:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     description: Create a new comment on a specific post. Requires authentication.
 *     security:
 *       - bearerAuth: []
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
 *               properties:
 *                 message:
 *                   type: string
 *                 newComment:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized (token missing or invalid)
 *       400:
 *         description: Missing or invalid data
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
 *     summary: Update a comment by its ID
 *     description: Update an existing comment. Only the owner can update. Requires authentication.
 *     security:
 *       - bearerAuth: []
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
 *               comment:
 *                 type: string
 *                 description: Updated content of the comment
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
 *       403:
 *         description: Unauthorized (not the owner)
 *       404:
 *         description: Comment not found or could not be updated
 */
router.put("/:_id", AuthControllers_1.authMiddleware, CommentControllers_1.default.updateComment.bind(CommentControllers_1.default));
/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment by its ID
 *     description: Delete an existing comment. Only the owner can delete. Requires authentication.
 *     security:
 *       - bearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Unauthorized (not the owner)
 *       404:
 *         description: Comment not found or could not be deleted
 */
router.delete("/:_id", AuthControllers_1.authMiddleware, (req, res) => {
    CommentControllers_1.default.deleteComment(req, res);
});
exports.default = router;
