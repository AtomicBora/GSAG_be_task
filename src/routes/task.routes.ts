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

taskRouter.post('/tasks', validateToken, createUserTask);

taskRouter.get('/tasks', validateToken, getAllUserTasks);

taskRouter.get('/task/:id', validateToken, getTaskById);

taskRouter.put('/task/:id', validateToken, updateTaskById);

taskRouter.delete('/task/:id', validateToken, deleteTaskById);

export default taskRouter;
