import express from 'express';
const router = express.Router();
import AuthControllers, { authMiddleware } from '../controllers/AuthControllers';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *       example:
 *         username: daniel
 *         email: daniel@gmail.com
 *         password: 123
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields or invalid data
 */
router.post('/register', AuthControllers.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Invalid username or password
 */
router.post('/login', AuthControllers.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log out a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to invalidate
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       400:
 *         description: Invalid or missing refresh token
 */
router.post('/logout', AuthControllers.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access and refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to renew
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', AuthControllers.refresh);

/**
 * @swagger
 * /auth/testAuth:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Test authentication middleware
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *       400:
 *         description: Missing or invalid token
 */
router.get('/testAuth', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'You are authenticated' });
});

export default router;
