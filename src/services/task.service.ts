import { Task } from '#@/types/Task';
import { UserTask } from '#@/types/User';
import poolClient from '#@/utils/createDBPool';
import logger from '#@/utils/logger';
import { isExistingTask } from '#@/utils/query.helpers';

const createUserTaskService = async (userId: number, task: Partial<Task>) => {
	const { description, priority, status, title } = task;

	try {
		// TODO: create helper function to insert task
		const result = await poolClient.query<Task>(
			'INSERT INTO gs_task (title, description, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
			[title, description, priority, status]
		);

		const taskId = result.rows[0].id;

		const jointTableUpdateResult = await poolClient.query<
			Pick<UserTask, 'task_id' | 'user_id'>
		>('INSERT INTO gs_user_task (gs_user_id, gs_task_id) VALUES ($1, $2)', [
			userId,
			taskId
		]);

		if (jointTableUpdateResult.rowCount === 0) {
			logger.error(`Error linking task for user ${userId.toString()}!`);
		}

		// ovo bi moglo da se stavi u neki log fajl da se prati ko je kada dodao sta i eventualno napravi neki revision history
		// ovako je nepotrebno i nepozeljno
		logger.info(
			`Task with id ${taskId.toString()} created for user ${userId.toString()}!`
		);

		return result.rows[0];
	} catch (error) {
		logger.error(
			`Error creating task for user ${userId.toString()}`,
			error
		);

		return null;
	}
};

const getAllTasks = async (userId: number) => {
	try {
		const result = await poolClient.query<Task>(
			'SELECT t.* FROM gs_task t JOIN gs_user_task ut ON t.id = ut.gs_task_id WHERE ut.gs_user_id = $1',
			[userId]
		);
		// write to log file if needed for future reference
		logger.info(
			`All tasks for user ${userId.toString()} retrieved!`,
			result
		);

		return result.rows;
	} catch (error) {
		logger.error(
			`Error getting all tasks for user ${userId.toString()}`,
			error
		);
		return null;
	}
};

const getSingleTask = async (taskId: number) => {
	try {
		const result = await poolClient.query<Task>(
			'SELECT * FROM gs_task WHERE id = $1',
			[taskId]
		);

		return result.rows[0];
	} catch (error) {
		logger.error(
			`Error getting single task with id ${taskId.toString()}`,
			error
		);
		return null;
	}
};

const updateSingleTask = async (task: Partial<Task>) => {
	const { description, id, priority, status, title } = task;

	const updatedTask = await poolClient.query<Task>(
		`UPDATE gs_task SET description = $1, priority = $2, status = $3, title = $4 WHERE id = $5 RETURNING *`,
		[description, priority, status, title, id]
	);

	if (updatedTask.rowCount === 0) {
		logger.error(
			'Error updating task! An error occurred while updating the task. Please contact the administrator.'
		);
		return null;
	}

	return updatedTask.rows[0];
};

const deleteTask = async (taskId: number) => {
	try {
		const taskExists = await isExistingTask(taskId);

		if (!taskExists) {
			logger.error(`Task with id ${taskId.toString()} does not exist!`);
			return { affectedRows: 0, command: '', deleted: false, taskId };
		}

		const result = await poolClient.query(
			'DELETE FROM gs_task WHERE id = $1',
			[taskId]
		);

		return {
			affectedRows: result.rowCount,
			command: result.command,
			deleted: true,
			taskId
		};
	} catch (error) {
		logger.error('Error deleting task');
		logger.error(error);
		return { affectedRows: 0, command: '', deleted: false, taskId };
	}
};

export {
	createUserTaskService,
	deleteTask,
	getAllTasks,
	getSingleTask,
	updateSingleTask
};
