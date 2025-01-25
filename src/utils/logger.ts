import dayjs from 'dayjs';
import type { Logger } from 'pino';
import { pino } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const createLogger = (): Logger =>
	pino({
		base: {
			pid: isProduction ? false : process.pid
		},
		level: isProduction ? 'info' : 'debug',
		redact: [],
		timestamp: () =>
			`,"time":"${dayjs().format('DD/MM/YYYY HH:mm:ss.SSS')}"`,
		transport: {
			options: {
				colorize: true
			},
			target: 'pino-pretty'
		}
	});

const logger: Logger = createLogger();

export default logger;
