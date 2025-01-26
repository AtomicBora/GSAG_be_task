import {
	createUserTask,
	getAllUserTasks,
	getTaskById
} from '#@/controllers/task.controller';
import { validateToken } from '#@/middleware/auth';
import express from 'express';

const taskRouter = express.Router();

taskRouter.post('/tasks', validateToken, createUserTask);

taskRouter.get('/tasks', validateToken, getAllUserTasks);

taskRouter.get('/task/:id', validateToken, getTaskById);

// TODO create routes for getting tasks by id, and for updating and deleting specific tasks

export default taskRouter;
