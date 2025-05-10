import { Bot } from 'grammy';
import type { MyContext } from '../types.js';
import { sessionMiddleware } from './sessions/session-middleware.js';

export const registerMiddlewares = (bot: Bot<MyContext>) => {
  sessionMiddleware(bot);
};
