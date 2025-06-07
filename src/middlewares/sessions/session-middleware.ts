import { Bot } from 'grammy';
import type { MyContext } from '../../types.js';
import { session } from 'grammy';

export interface SessionData {
  waitingFor?: string;
  mealType?: string;
  editMealId?: string;
  editItemId?: string;
  editPage?: number;
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
