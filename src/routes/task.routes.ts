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
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartialTask'
 *     responses:
 *       '201':
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: User not found
 */
taskRouter.post('/tasks', validateToken, createUserTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for the user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: User not found or no tasks found
 *       '500':
 *         description: Internal server error
 */
taskRouter.get('/tasks', validateToken, getAllUserTasks);

/**
 * @swagger
 * /task/:id:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: The ID of the task to retrieve
 *     responses:
 *       '200':
 *         description: A task object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Task with specified ID not found
 *       '500':
 *         description: Internal server error
 */
taskRouter.get('/task/:id', validateToken, getTaskById);

/**
 * @swagger
 * /task/:id:
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: The ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartialTask'
 *     responses:
 *       '200':
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Error updating task! Please check the input data and task id.
 *       '403':
 *         description: You do not have permission to delete this task.
 *       '404':
 *         description: User or task not found
 *       '500':
 *         description: Internal server error
 */
taskRouter.put('/task/:id', validateToken, updateTaskById);

/**
 * @swagger
 * /task/:id:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: The ID of the task to delete
 *     responses:
 *       '204':
 *         description: Task deleted successfully
 *       '400':
 *         description: Bad request
 *       '403':
 *         description: You do not have permission to delete this task.
 *       '404':
 *         description: Task or user not found
 *       '500':
 *          description: Internal server error
 */
taskRouter.delete('/task/:id', validateToken, deleteTaskById);

export default taskRouter;
