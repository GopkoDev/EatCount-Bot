import { Bot } from 'grammy';
import type { MyContext } from '../../types.js';
import { session } from 'grammy';

export interface SessionData {
  waitingFor?: string;
  mealType?: string;
}

export const sessionMiddleware = (bot: Bot<MyContext>) => {
  bot.use(
    session({
      initial(): SessionData {
        return {};
      },
    })
  );
};
