import { CustomRequest, DecodedToken } from '#@/middleware/auth';
import { createUserTaskService } from '#@/services/task.service';
import { Task } from '#@/types/Task';
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

		res.status(201).json(createdTask);
	} catch (error) {
		logger.error(`Error creating task for user with email ${email}!`);
		logger.error(error);
		res.status(400).json({
			error: 'An error occurred while creating the task. Please contact the administrator.'
		});
	}
};

export { createUserTask };
