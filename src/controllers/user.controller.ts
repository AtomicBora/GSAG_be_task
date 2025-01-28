import type { User } from '#types/User';
import type { Request, Response } from 'express';

import {
	createUserService,
	findUserByEmail,
	generateToken
} from '#@/services/user.service';
import { isExistingEmail } from '#@/utils/query.helpers';

import logger from '../utils/logger.js';

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
			res.status(401).send('Passwords do not match');
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

		res.status(201).json(newUser.rows[0]);
	} catch (err) {
		logger.error(err);
		res.status(500).send('Internal server error! User not created.');
	}
};

const loginUser = async (
	req: Request<unknown, unknown, Pick<User, 'email' | 'password'>>,
	res: Response
) => {
	try {
		const { email, password } = req.body;

		const user = await findUserByEmail(email, password);

		if (!user) {
			res.status(401).send('Invalid email or password');
			return;
		}

		const token = generateToken(user.email);

		logger.info(`User ${user.email} logged in`);
		res.status(200).json({ token });
	} catch (err) {
		logger.error(err);
		res.status(500).send('Internal server error!');
	}
};

export { createUser, loginUser };
