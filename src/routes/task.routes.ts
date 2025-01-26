import { createUserTask } from '#@/controllers/task.controller';
import { validateToken } from '#@/middleware/auth';
import express from 'express';

const taskRouter = express.Router();

taskRouter.post('/tasks', validateToken, createUserTask);

// TODO create routes for getting all user tasks and tasks by id, and for updating and deleting tasks
// taskRouter.get('/user/:id/tasks', validateToken, getAllUserTasks);

export default taskRouter;
