import { assertIsDefined } from '#@/utils/assert';
import logger from '#@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface CustomRequest extends Request {
	token?: JwtPayload | string | undefined;
}

export interface DecodedToken {
	email: string;
	exp: number;
	iat: number;
}

export const validateToken = (
	req: CustomRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader ? authHeader.split(' ')[1] : null;

		if (!token) {
			res.status(401).send('Token required');
			return;
		}

		assertIsDefined(
			process.env.JWT_SECRET,
			'JWT_SECRET environment variable not set'
		);

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		req.token = decoded as DecodedToken;

		next();
	} catch (error) {
		res.status(401).json({ ms: 'Please authenticate' });
		logger.error(error);
	}
};
