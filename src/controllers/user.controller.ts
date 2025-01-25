import type { User } from '#types/User';
import type { Request, Response } from 'express';

import { createUserService, isExistingEmail } from '#@/services/user.service';

import logger from '../utils/logger';

const createUser = async (
	req: Request<unknown, unknown, User>,
	res: Response
) => {
	try {
		const {
			email,
			first_name,
			last_name,
			password,
			password_confirmation
		} = req.body;

		if (password !== password_confirmation) {
			res.send('Passwords do not match').status(401);
			logger.error('Passwords do not match');
			return;
		}

		const userExists = await isExistingEmail(email);
        
		if (userExists) {
			// hiding the error message for security reasons
			res.status(409).send(
				'Please try again with different credentials.'
			);
			logger.error('User with this email already exists');
			return;
		}

		const newUser = await createUserService({
			email,
			first_name,
			last_name,
			password,
			password_confirmation
		});

		res.json(newUser.rows[0]).status(201);
	} catch (err) {
		logger.error(err);
		res.status(400).send('Error creating user');
	}
};

export { createUser };
