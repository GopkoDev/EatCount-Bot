import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { Bot, BotError, Context } from 'grammy';

const { combine, timestamp, printf, colorize } = winston.format;

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Define DailyRotateFile type
interface DailyRotateFile {
  filename: string;
  datePattern: string;
  maxSize: string;
  maxFiles: string;
  format: winston.Logform.Format;
}

// Create DailyRotateFile transport
const fileRotateTransport = new (winston.transports as any).DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
} as DailyRotateFile);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    fileRotateTransport,
  ],
});

// For grammy middleware to log requests
export const botRequestLogger = <C extends Context>(bot: Bot<C>) => {
  bot.use(async (ctx, next) => {
    const start = Date.now();

    await next();

    const duration = Date.now() - start;
    logger.info(
      `Telegram ${
        ctx.update.message?.text || ctx.update.callback_query?.data || 'update'
      }`,
      {
        chatId: ctx.chat?.id,
        userId: ctx.from?.id,
        username: ctx.from?.username,
        duration: `${duration}ms`,
      }
    );
  });
};

// For error handling in grammy
export const botErrorLogger = <C extends Context>(err: BotError<C>) => {
  logger.error(err.message, {
    stack: err.stack,
    update: err.ctx?.update,
    botInfo: err.ctx?.me,
  });
};

export default logger;
