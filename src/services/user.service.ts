import type { User } from '#types/User';

import { assertIsDefined } from '#@/utils/assert';
import { compare, genSalt, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';

import poolClient from '../utils/createDBPool.js';
import logger from '../utils/logger.js';

/* 
TODO: implement validation schema to validate user data.. joi/zod/yup, replace  Omit<User, 'id'> with DTO generated from schema 
*/
const createUserService = async (userData: Omit<User, 'id'>) => {
	try {
		const { email, first_name, last_name, password } = userData;

		const saltRounds = 10;
		const salt = await genSalt(saltRounds);
		const hashedPassword = await hash(password, salt);

		const newUser = await poolClient.query<User>(
			'INSERT INTO user_gs (email, first_name, last_name, password) VALUES($1, $2, $3, $4) RETURNING id',
			[email, first_name, last_name, hashedPassword]
		);

		return newUser;
	} catch (error) {
		logger.error('Error creating user:', error);
		throw new Error('Error creating user');
	}
};

const findUserByEmail = async (
	email: string,
	password: string
): Promise<null | Pick<User, 'email' | 'password'>> => {
	try {
		const result = await poolClient.query<Pick<User, 'email' | 'password'>>(
			'SELECT email, password FROM user_gs WHERE email = $1',
			[email]
		);

		if (result.rows.length === 0) {
			logger.error('Invalid email or password');
			return null;
		}

		const [user] = result.rows;

		const isPasswordValid = await compare(password, user.password);

		if (!isPasswordValid) {
			logger.error('Invalid email or password');
			return null;
		}

		return user;
	} catch (error) {
		logger.error('Error logging in:', error);
		throw new Error('Error logging in');
	}
};

const generateToken = (email: string) => {
	assertIsDefined(process.env.JWT_SECRET, 'JWT_SECRET is not defined');

	return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

export { createUserService, findUserByEmail, generateToken };
