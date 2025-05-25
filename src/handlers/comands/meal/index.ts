import { Bot } from 'grammy';
import type { PrismaClient, MealType } from '@prisma/client';
import type { MyContext } from '../../../types.js';
import { showMealTypesMenu } from '../../../menus/meal-menus.js';

export const mealCommand = (bot: Bot<MyContext>, db: PrismaClient) => {
  bot.command('meal', async (ctx) => {
    await showMealTypesMenu(ctx);
  });
};
