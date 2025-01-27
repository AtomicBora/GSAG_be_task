import { createUser, loginUser } from '#@/controllers/user.controller';
import express from 'express';

const userRouter = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     description: Registers a new user with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '201':
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request data.
 *       '401':
 *         description: Unauthorized - Passwords do not match.
 *       '409':
 *         description: User already exists.
 *       '500':
 *         description: Internal server error.
 */
userRouter.post('/users', createUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     description: Authenticates a user with the provided email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "The user's email address."
 *                 format: email
 *               password:
 *                 type: string
 *                 description: "The user's password."
 *                 minLength: 8
 *                 writeOnly: true
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: User logged in successfully.
 *       '401':
 *         description: Unauthorized - Invalid email or password.
 *       '500':
 *         description: Internal server error.
 */
userRouter.post('/login', loginUser);

export default userRouter;
