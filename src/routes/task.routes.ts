import {
	createUserTask,
	deleteTaskById,
	getAllUserTasks,
	getTaskById,
	updateTaskById
} from '#@/controllers/task.controller';
import { validateToken } from '#@/middleware/auth';
import express from 'express';

const taskRouter = express.Router();

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Task created successfully
 *       '400':
 *         description: Bad request
 */
taskRouter.post('/tasks', validateToken, createUserTask);

taskRouter.get('/tasks', validateToken, getAllUserTasks);

taskRouter.get('/task/:id', validateToken, getTaskById);

taskRouter.put('/task/:id', validateToken, updateTaskById);

taskRouter.delete('/task/:id', validateToken, deleteTaskById);

export default taskRouter;
