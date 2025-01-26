import { User } from '#@/types/User';

import poolClient from './createDBPool';
import logger from './logger';

const isExistingEmail = async (email: string): Promise<boolean> => {
	try {
		const result = await poolClient.query<{ exists: boolean }>(
			'SELECT EXISTS (SELECT 1 FROM user_gs WHERE email = $1)',
			[email]
		);
		return result.rows[0].exists;
	} catch (error) {
		logger.error('Error checking if user exists:', error);
		throw new Error('Error checking if user exists');
	}
};

const isExistingTask = async (taskId: number) => {
	try {
		const result = await poolClient.query<{ exists: boolean }>(
			'SELECT EXISTS(SELECT * FROM task_gs WHERE id = $1)',
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
			'SELECT * FROM user_task_gs WHERE user_id = $1 AND task_id = $2',
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
		await poolClient.query(
			'DELETE FROM user_task_gs WHERE user_id = $1 AND task_id = $2',
			[userId, taskId]
		);
	} catch (error) {
		logger.error(
			`Error removing user with id ${userId.toString()} from task with id ${taskId.toString()}`,
			error
		);
	}
};

const findByEmail = async (email: string) => {
	const user = await poolClient.query<User>(
		'SELECT * FROM user_gs WHERE email = $1',
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
