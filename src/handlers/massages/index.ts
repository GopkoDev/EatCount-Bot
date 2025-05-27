import { Bot } from 'grammy';
import type { MyContext } from '../../types.js';
import type { PrismaClient } from '@prisma/client';

import { mealDescription } from './meal/meal-description.js';
import { calorieTargetHandler } from './settings/calorie-target.js';

export const registerMassages = (bot: Bot<MyContext>, db: PrismaClient) => {
  const handlers: Record<string, (ctx: MyContext) => Promise<void>> = {
    calorie_target: async (ctx) => await calorieTargetHandler(ctx, db),
    meal_description: async (ctx) => await mealDescription(ctx, db),
  };

  bot.on('message:text', async (ctx, next) => {
    const waitingFor = ctx.session.waitingFor as string | undefined;
    const handler = waitingFor ? handlers[waitingFor] : undefined;

    if (handler) {
      await handler(ctx);
    } else {
      await next();
    }
  });
};
