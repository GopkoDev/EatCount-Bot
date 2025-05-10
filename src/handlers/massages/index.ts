import { Bot } from 'grammy';
import type { MyContext } from '../../types.js';
import type { PrismaClient } from '@prisma/client';

import { mealDescription } from './meal/meal-description.js';

export const registerMassages = (bot: Bot<MyContext>, db: PrismaClient) => {
  mealDescription(bot, db);
};
