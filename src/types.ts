import { Context } from 'grammy';
import type { SessionData } from './middlewares/sessions/session-middleware.js';

// Extend the Context type to include session
export interface MyContext extends Context {
  session: SessionData;
}
