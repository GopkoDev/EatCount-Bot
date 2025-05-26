import { Bot } from 'grammy';
import type { MyContext } from '../../types.js';
import type { PrismaClient } from '@prisma/client/extension';

import { mainMenuCallbacks } from './main-menu/index.js';
import { mealMenuCallbacks } from './meal-menu/index.js';
import { statisticsMenuCallbacks } from './statistics-menu/index.js';

export const registerKeyboardsCallbacks = (
  bot: Bot<MyContext>,
  db: PrismaClient
) => {
  mainMenuCallbacks(bot);
  mealMenuCallbacks(bot);
  statisticsMenuCallbacks(bot, db);
};
