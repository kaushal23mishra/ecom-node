import winston from 'winston';
import 'winston-daily-rotate-file';
import { AsyncLocalStorage } from 'async_hooks';

const context = new AsyncLocalStorage<Map<string, string>>();

const logFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
  const store = context.getStore();
  const requestId = store ? store.get('requestId') : null;
  let msg = `${timestamp} [${level}]: ${message} `;
  if (requestId) {
    msg += `(RequestID: ${requestId}) `;
  }
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'node-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Stream for Morgan
(logger as any).stream = { write: (message: string) => logger.info(message.trim()) };

export { context };
export default logger;

// For CommonJS compatibility
if (typeof module !== 'undefined') {
  (logger as any).context = context;
  module.exports = logger;
}
