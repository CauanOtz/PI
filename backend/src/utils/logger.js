// src/utils/logger.js
import { createLogger, format, transports } from 'winston';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const level = process.env.LOG_LEVEL || (env === 'development' ? 'debug' : 'info');

const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.colorize({ all: true }),
  format.printf(({ level, message, timestamp, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${rest}`;
  })
);

const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.json()
);

const logger = createLogger({
  level,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  transports: [
    new transports.Console({ format: consoleFormat }),
  ],
});

// In production also write to files (best-effort; filesystem may be ephemeral)
if (env === 'production') {
  const logsDir = path.resolve('logs');
  logger.add(new transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error', format: fileFormat }));
  logger.add(new transports.File({ filename: path.join(logsDir, 'combined.log'), format: fileFormat }));
}

export default logger;

