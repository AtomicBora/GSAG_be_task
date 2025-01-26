import { CustomRequest, DecodedToken } from '#@/middleware/auth';
import {
	createUserTaskService,
	getAllTasks,
	getSingleTask
} from '#@/services/task.service';
import { Task } from '#@/types/Task';
import { User } from '#@/types/User';
import logger from '#@/utils/logger';
import { findByEmail } from '#@/utils/query.helpers';
import { Request, Response } from 'express';

const createUserTask = async (
	req: Request<unknown, unknown, Task>,
	res: Response
) => {
	const { description, priority, status, title } = req.body;
	const { email } = (req as CustomRequest).token as DecodedToken;

	try {
		const user = await findByEmail(email);

		if (!user) {
			logger.error(`User with email ${email} not found`);
			res.status(404).json({
				error: 'User not found. Refresh the page and try again.'
			});
			return;
		}

		const userId = user.id;

		const task: Partial<Task> = {
			description,
			priority,
			status,
			title
		};

		const createdTask = await createUserTaskService(userId, task);

		if (!createdTask) {
			res.status(400).json({
				error: 'Task not created! An error occurred while creating the task. Please contact the administrator.'
			});
			return;
		}

		res.status(201).json(createdTask);
	} catch (error) {
		logger.error(`Error creating task for user with email ${email}!`);
		logger.error(error);
		res.status(400).json({
			error: 'An error occurred while creating the task. Please contact the administrator.'
		});
	}
};

const getAllUserTasks = async (
	req: Request<unknown, unknown, unknown, Pick<User, 'email'>>,
	res: Response
) => {
	const { email } = (req as CustomRequest).token as DecodedToken;

	const user = await findByEmail(email);

	if (!user) {
		logger.error(`User with email ${email} not found`);
		res.status(404).json({
			error: 'User not found. Refresh the page and try again.'
		});
		return;
	}

	const userId = user.id;

	const tasks = await getAllTasks(userId);

	if (!tasks) {
		res.status(404).json({
			error: `No tasks found for user ${userId.toString()}.`
		});
		logger.error(`No tasks found for user ${userId.toString()}.`);
		return;
	}

	res.status(200).json({ tasks });
};

const getTaskById = async (
	req: Request<Pick<Partial<Task>, 'id'>>,
	res: Response
) => {
	const { id } = req.params;

	if (!id || isNaN(id)) {
		res.status(400).json({
			error: 'Please provide task id.'
		});
		logger.error('Please provide task id.');
		return;
	}

	const task = await getSingleTask(id);

	if (!task) {
		res.status(404).json({
			error: `Task with id ${id.toString()} not found.`
		});
		logger.error(`Task with id ${id.toString()} not found.`);
		return;
	}

	res.status(200).json(task);
};

export { createUserTask, getAllUserTasks, getTaskById };
