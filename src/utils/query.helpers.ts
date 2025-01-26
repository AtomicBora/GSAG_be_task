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

export { findByEmail, isExistingEmail };
