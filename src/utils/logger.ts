import type { Logger } from 'pino';

import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import { pino } from 'pino';
import { fileURLToPath } from 'url';

const isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createLogger = (): Logger => {
	const baseConfig = {
		pid: isProduction ? undefined : process.pid
	};
	const timestampConfig = () =>
		`,"time":"${dayjs().format('DD/MM/YYYY HH:mm:ss.SSS')}"`;
	const levelConfig = isProduction ? 'info' : 'debug';
	const options: pino.LoggerOptions = {
		base: baseConfig,
		level: levelConfig,
		redact: [],
		timestamp: timestampConfig
	};

	if (!isProduction) {
		options.transport = {
			options: {
				colorize: true
			},
			target: 'pino-pretty'
		};
	}
	try {
		const logsPath = path.join(__dirname, '..', '..', 'logs', 'app.log');
		const logsDir = path.dirname(logsPath);

		if (!fs.existsSync(logsDir)) {
			try {
				fs.mkdirSync(logsDir, { recursive: true });
				console.log(`Directory created: ${logsDir}`);
			} catch (error) {
				console.error(`Failed to create directory: ${logsDir}`, error);
				throw error;
			}
		}

		if (!fs.existsSync(logsPath)) {
			try {
				fs.writeFileSync(logsPath, '');
				console.log(`File created: ${logsPath}`);
			} catch (error) {
				console.error(`Failed to create file: ${logsPath}`, error);
				throw error;
			}
		}

		return pino(options, pino.destination(logsPath));
	} catch (error) {
		console.error('Failed to create logger:', error);
		throw error;
	}
};

const logger: Logger = createLogger();

export default logger;
