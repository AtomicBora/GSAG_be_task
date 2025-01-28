import { CustomRequest, DecodedToken } from '#@/middleware/auth';
import {
	createUserTaskService,
	deleteTask,
	getAllTasks,
	getSingleTask,
	updateSingleTask
} from '#@/services/task.service';
import { Task } from '#@/types/Task';
import { User } from '#@/types/User';
import logger from '#@/utils/logger';
import {
	checkIsUserTaskCreator,
	findByEmail,
	isExistingTask,
	removeUserTaskAssociation
} from '#@/utils/query.helpers';
import { Request, Response } from 'express';

/**
 * Create a new task
 * @param req Express request object
 * @param res Express response object
 */
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
				error: 'User not found. Please login again. If that does not work, contact the administrator.'
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
				error: 'Task not created! An error occurred while creating the task. Please check the provided data and try again.'
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

/**
 * Get all tasks for the user
 * @param req Express request object
 * @param res Express response object
 */
const getAllUserTasks = async (
	req: Request<unknown, unknown, Pick<User, 'email'>>,
	res: Response
) => {
	const { email } = (req as CustomRequest).token as DecodedToken;

	try {
		const user = await findByEmail(email);

		if (!user) {
			logger.error(`User with email ${email} not found`);

			res.status(404).json({
				error: 'User not found. Please login again. If that does not work, contact the administrator.'
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

		res.status(200).json(tasks);
	} catch (error) {
		logger.error(
			`Error retrieving tasks for user with email ${email}!`,
			error
		);
		res.status(500).json({
			error: 'An unexpected error occurred. Please try again later.'
		});
	}
};

/**
 * Get a task by ID
 * @param req Express request object
 * @param res Express response object
 */
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
	try {
		const task = await getSingleTask(id);

		if (!task) {
			res.status(404).json({
				error: `Task with id ${id.toString()} not found.`
			});
			logger.error(`Task with id ${id.toString()} not found.`);
			return;
		}

		res.status(200).json(task);
	} catch (error) {
		logger.error(`Error retrieving task with id ${id.toString()}!`);
		logger.error(error);
		res.status(500).json({
			error: 'An unexpected error occurred. Please try again later.'
		});
	}
};

/**
 * Update a task by ID
 * @param req Express request object
 * @param res Express response object
 */
const updateTaskById = async (
	req: Request<Pick<Partial<Task>, 'id'>, unknown, Partial<Task>>,
	res: Response
) => {
	const { id: taskId } = req.params;
	const { description, priority, status, title } = req.body;
	const { email } = (req as CustomRequest).token as DecodedToken;

	if (!taskId || isNaN(taskId)) {
		res.status(400).json({
			error: 'Error updating task! Please provide task id.'
		});
		logger.error('Error updating task! Please provide task id.');
		return;
	}

	try {
		const user = await findByEmail(email);

		if (!user) {
			logger.error(`User with email ${email} not found`);
			res.status(404).json({
				error: 'User not found. Please login again. If that does not work, contact the administrator.'
			});
			return;
		}

		const userId = user.id;
		const task = await getSingleTask(taskId);

		if (!task) {
			res.status(404).json({
				error: `Task with id ${taskId.toString()} not found.`
			});
			logger.error(`Task with id ${taskId.toString()} not found.`);
			return;
		}

		const isTaskCreator = await checkIsUserTaskCreator(userId, taskId);

		if (!isTaskCreator) {
			res.status(403).json({
				error: 'You do not have permission to update this task.'
			});
			logger.error(
				`User ${userId.toString()} tried to update task ${taskId.toString()}, but does not have permission.`
			);
			return;
		}

		const updatedTaskValues: Partial<Task> = {
			...task,
			description: description ?? task.description,
			priority: priority ?? task.priority,
			status: status ?? task.status,
			title: title ?? task.title
		};

		const updatedTask = await updateSingleTask(updatedTaskValues);

		if (!updatedTask) {
			res.status(400).json({
				error: 'Task not updated! Please check the provided data and try again.'
			});
			logger.error(
				'Task not updated! Please check the provided data and try again.'
			);
			return;
		}

		res.status(200).json(updatedTask);
	} catch (error) {
		logger.error(`Error updating task with id ${taskId.toString()}!`);
		logger.error(error);
		res.status(500).json({
			error: 'Error updating task! An error occurred while updating the task. Please contact the administrator.'
		});
	}
};

/**
 * Delete a task by ID
 * @param req Express request object
 * @param res Express response object
 */
const deleteTaskById = async (
	req: Request<Pick<Partial<Task>, 'id'>>,
	res: Response
) => {
	const { id: taskId } = req.params;
	const { email } = (req as CustomRequest).token as DecodedToken;

	if (!taskId || isNaN(taskId)) {
		res.status(400).json({
			error: 'Bad Request! Please provide valid task id.'
		});
		logger.error('Bad Request! Please provide valid task id.');
		return;
	}

	try {
		const user = await findByEmail(email);

		if (!user) {
			logger.error(`User with email ${email} not found`);
			res.status(404).json({
				error: 'User not found. Please login again. If that does not work, contact the administrator.'
			});
			return;
		}

		const userId = user.id;

		const taskExists = await isExistingTask(taskId);

		if (!taskExists) {
			res.status(404).json({
				error: `Task with provided id ${taskId.toString()} not found.`
			});
			logger.error(`Task with id ${taskId.toString()} not found.`);
			return;
		}

		const isTaskCreator = await checkIsUserTaskCreator(userId, taskId);

		if (!isTaskCreator) {
			res.status(403).json({
				error: 'You do not have permission to delete this task.'
			});
			logger.error(
				`User ${userId.toString()} tried to delete task ${taskId.toString()}, but does not have permission.`
			);
			return;
		}

		const removedAssociation = await removeUserTaskAssociation(
			userId,
			taskId
		);

		if (!removedAssociation) {
			res.status(400).json({
				error: 'No user task relation found! Database integrity error. Please contact the administrator.'
			});
			logger.error(
				'No user task relation found! Database integrity error. Please contact the administrator.'
			);
			return;
		}

		const result = await deleteTask(taskId);

		if (!result.deleted) {
			res.status(400).json({
				error: 'Deleting task failed! Please contact the administrator.'
			});
			logger.error(
				'Deleting task failed! Please contact the administrator.'
			);
			return;
		}

		res.status(204).end();
	} catch (error) {
		logger.error(`Error deleting task with id ${taskId.toString()}!`);
		logger.error(error);
		res.status(500).json({
			error: 'Error deleting task! An error occurred while deleting the task. Please contact the administrator.'
		});
	}
};

export {
	createUserTask,
	deleteTaskById,
	getAllUserTasks,
	getTaskById,
	updateTaskById
};
