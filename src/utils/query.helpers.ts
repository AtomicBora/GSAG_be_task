import { User } from '#@/types/User';

import poolClient from './createDBPool.js';
import logger from './logger.js';

const isExistingEmail = async (email: string): Promise<boolean> => {
	try {
		const result = await poolClient.query<{ exists: boolean }>(
			'SELECT EXISTS (SELECT 1 FROM gs_user WHERE email = $1)',
			[email]
		);
		return result.rows[0].exists;
	} catch (error) {
		logger.error('Error checking if user exists:', error);
		return false;
	}
};

const isExistingTask = async (taskId: number) => {
	try {
		const result = await poolClient.query<{ exists: boolean }>(
			'SELECT EXISTS(SELECT * FROM gs_task WHERE id = $1)',
			[taskId]
		);
		return result.rows[0].exists;
	} catch (error) {
		logger.error(
			`Error checking if task with id ${taskId.toString()} exists`,
			error
		);
		return false;
	}
};

const checkIsUserTaskCreator = async (
	userId: number,
	taskId: number
): Promise<boolean> => {
	try {
		const result = await poolClient.query(
			'SELECT * FROM gs_user_task WHERE gs_user_id = $1 AND gs_task_id = $2',
			[userId, taskId]
		);

		return result.rows.length > 0 ? true : false;
	} catch (error) {
		logger.error(
			`Error checking if user with id ${userId.toString()} is task creator for task with id ${taskId.toString()}`,
			error
		);
		return false;
	}
};

const removeUserTaskAssociation = async (userId: number, taskId: number) => {
	try {
		const result = await poolClient.query(
			'DELETE FROM gs_user_task WHERE gs_user_id = $1 AND gs_task_id = $2',
			[userId, taskId]
		);

		if (result.rowCount === 0) {
			logger.info('No user-task association found!');
			return false;
		}

		logger.info(`User-task association removed!`);
		return true;
	} catch (error) {
		logger.error(
			`Error removing user with id ${userId.toString()} from task with id ${taskId.toString()}`,
			error
		);
		return false;
	}
};

const findByEmail = async (email: string) => {
	const user = await poolClient.query<User>(
		'SELECT * FROM gs_user WHERE email = $1',
		[email]
	);
	if (user.rows.length === 0) {
		logger.info(`User with email ${email} found`);
		return null;
	}
	return user.rows[0];
};

export {
	checkIsUserTaskCreator,
	findByEmail,
	isExistingEmail,
	isExistingTask,
	removeUserTaskAssociation
};
