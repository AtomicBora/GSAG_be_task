import pg from 'pg';
const { Pool } = pg;
import { assertIsDefined } from './assert.js';

assertIsDefined(
	process.env.DB_MAX_CONNECTIONS,
	'DB_MAX_CONNECTIONS is not defined'
);

assertIsDefined(process.env.DB_PORT, 'DB_PORT is not defined');


const poolClient = new Pool({
	database: process.env.DB_NAME,
	host: process.env.DB_HOST,
	idleTimeoutMillis: 15000,
	max: +process.env.DB_MAX_CONNECTIONS,
	password: process.env.DB_PASSWORD,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER
});

export default poolClient;
