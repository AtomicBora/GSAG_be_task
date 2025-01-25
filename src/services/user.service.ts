import type { User } from '#types/User';

import { genSalt, hash } from 'bcrypt';

import poolClient from '../utils/createDBPool';
import logger from '../utils/logger';

const isExistingEmail = async (email: string): Promise<boolean> => {
	try {
		const result = await poolClient.query<{ exists: boolean }>(
			'SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)',
			[email]
		);
		return result.rows[0].exists;
	} catch (error) {
		logger.error('Error checking if user exists:', error);
		throw new Error('Error checking if user exists');
	}
};

const createUserService = async (userData: User) => {
	try {
		const { email, first_name, last_name, password } = userData;

		const saltRounds = 10;
		const salt = await genSalt(saltRounds);
		const hashedPassword = await hash(password, salt);

		const newUser = await poolClient.query<User>(
			'INSERT INTO users (email, first_name, last_name, password) VALUES($1, $2, $3, $4) RETURNING id',
			[email, first_name, last_name, hashedPassword]
		);

		return newUser;
	} catch (error) {
		logger.error('Error creating user:', error);
		throw new Error('Error creating user');
	}
};

export { createUserService, isExistingEmail };
