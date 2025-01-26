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

const getAllUserTasks = async (
	req: Request<unknown, unknown, Pick<User, 'email'>>,
	res: Response
) => {
	const { email } = (req as CustomRequest).token as DecodedToken;

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
		res.status(400).json({
			error: 'Error updating task! An error occurred while updating the task. Please contact the administrator.'
		});
	}
};

const deleteTaskById = async (
	req: Request<Pick<Partial<Task>, 'id'>>,
	res: Response
) => {
	const { id: taskId } = req.params;
	const { email } = (req as CustomRequest).token as DecodedToken;

	if (!taskId || isNaN(taskId)) {
		res.status(400).json({
			error: 'Please provide task id.'
		});
		logger.error('Please provide task id.');
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

		await removeUserTaskAssociation(userId, taskId);

		const deletedTask = await deleteTask(taskId);

		res.status(200).json(deletedTask);
	} catch (error) {
		logger.error(`Error deleting task with id ${taskId.toString()}!`);
		logger.error(error);
		res.status(400).json({
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
