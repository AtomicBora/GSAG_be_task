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

export { createUserTaskService };
