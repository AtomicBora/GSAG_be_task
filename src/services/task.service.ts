import { Task } from '#@/types/Task';
import { UserTask } from '#@/types/User';
import poolClient from '#@/utils/createDBPool';
import logger from '#@/utils/logger';

const createUserTaskService = async (userId: number, task: Partial<Task>) => {
	const { description, priority, status, title } = task;

	try {
		// TODO: create helper function to insert task
		const result = await poolClient.query<Task>(
			'INSERT INTO task_GS (title, description, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
			[title, description, priority, status]
		);

		const taskId = result.rows[0].id;

		const jointTableUpdateResult = await poolClient.query<
			Pick<UserTask, 'task_id' | 'user_id'>
		>('INSERT INTO user_task_GS (user_id, task_id) VALUES ($1, $2)', [
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
			'SELECT t.* FROM task_gs t JOIN user_task_gs ut ON t.id = ut.task_id WHERE ut.user_id = $1',
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
			'SELECT * FROM task_gs WHERE id = $1',
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

export { createUserTaskService, getAllTasks, getSingleTask };
