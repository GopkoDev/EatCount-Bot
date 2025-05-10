import { Bot } from 'grammy';
import type { MyContext } from '../../types.js';
import type { PrismaClient } from '@prisma/client';

import { startCommand } from './start/index.js';
import { mealCommand } from './meal/index.js';

export const registerCommands = (bot: Bot<MyContext>, db: PrismaClient) => {
  startCommand(bot, db); // /start
  mealCommand(bot, db); // /meal
};
