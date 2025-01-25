import express from 'express';

import { assertIsDefined } from './utils/assert';

const app = express();

app.get('/healthcheck', (_, res) => {
	res.sendStatus(200);
});

app.use(express.json());

//this will throw an error if SERVER_PORT is not defined in the environment variables

assertIsDefined(
	process.env.SERVER_PORT,
	'Server port is not defined. Check your environment variables.'
);

const port = process.env.SERVER_PORT;

app.listen(port, () => {
	console.log(`Server listening on port ${port}!`);
});
