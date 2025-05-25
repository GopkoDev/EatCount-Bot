import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import type { MealType, PrismaClient } from '@prisma/client';

import logger from '../../../lib/logger.js';
import { showMainMenu } from '../../../menus/main-menu.js';
import { mealDescriptionProcessor } from '../../callbacks/meal-menu/services/meal-description-processor.js';

export const mealDescription = (bot: Bot<MyContext>, db: PrismaClient) => {
  bot.on('message:text', async (ctx) => {
    if (ctx.session.waitingFor === 'meal_description' && ctx.session.mealType) {
      const mealDescription = ctx.message.text;
      const mealType = ctx.session.mealType as MealType;
      const userId = ctx.from.id.toString();

      ctx.session.waitingFor = undefined;
      ctx.session.mealType = undefined;

      await ctx.reply('Аналізую ваш прийом їжі, будь ласка, зачекайте...');

      try {
        const nutritionMessage = await mealDescriptionProcessor({
          db,
          mealDescription,
          mealType,
          userId,
        });

        await ctx.reply(nutritionMessage, { parse_mode: 'Markdown' });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error(
          `Error processing meal description for user ${userId}: ${errorMessage}`,
          error
        );
        await ctx.reply(
          `Виникла помилка при обробці вашого прийому їжі. Будь ласка, спробуйте ще раз пізніше.`
        );
      }

      await showMainMenu(ctx);
    }
  });
};
