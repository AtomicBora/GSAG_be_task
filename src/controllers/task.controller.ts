import { CustomRequest, DecodedToken } from '#@/middleware/auth';
import { Task } from '#@/types/Task';
import { UserTask } from '#@/types/User';
import poolClient from '#@/utils/createDBPool';
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

        // TODO: move logic to task service

		// TODO: create helper function to insert task
		const result = await poolClient.query<Task>(
			'INSERT INTO task_GS (title, description, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
			[title, description, priority, status]
		);

		const taskId = result.rows[0].id;

		//TODO: create helper function to link task with user
		const jointTableUpdateResult = await poolClient.query<
			Pick<UserTask, 'task_id' | 'user_id'>
		>('INSERT INTO user_task_GS (user_id, task_id) VALUES ($1, $2)', [
			userId,
			taskId
		]);

		logger.info({ jointTableUpdateResult });

		if (jointTableUpdateResult.rowCount === 0) {
			logger.error(`Error linking task with user with email ${email}!`);
		}

		logger.info(
			`Task with id ${taskId.toString()} created for user with email ${email}!`
		);

		res.status(201).json(result.rows[0]);
	} catch (error) {
		logger.error(`Error creating task for user with email ${email}!`);
		logger.error(error);
		res.status(400).json({
			error: 'An error occurred while creating the task. Please contact the administrator.'
		});
	}
};

export { createUserTask };
