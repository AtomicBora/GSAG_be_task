import express from 'express';
import helmet from 'helmet';

import { taskRouter, userRouter } from './routes';
import { assertIsDefined } from './utils/assert';
import logger from './utils/logger';

const app = express();

app.get('/healthcheck', (_, res) => {
	res.sendStatus(200);
});

app.use(helmet());
app.use(express.json());

// simple versioning system for the API, better approach would be to use for example semver library

app.use('/api/v1', userRouter);
app.use('/api/v1', taskRouter);

// this assert function will throw an error if SERVER_PORT is not defined in the environment variables

assertIsDefined(
	process.env.SERVER_PORT,
	'Server port is not defined. Check your environment variables.'
);

const port = process.env.SERVER_PORT;

app.listen(port)
	.on('listening', () => {
		logger.info(`Server listening on port ${port}!`);
	})
	.on('error', (err: NodeJS.ErrnoException) => {
		if (err.code === 'EADDRINUSE') {
			logger.error(
				`Port ${port} is already in use. Please choose another port.`
			);
		} else {
			logger.error(
				`Failed to start server on port ${port}. Error: ${err.message}`
			);
		}
		process.exit(1);
	});
