import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import type { MealType, PrismaClient } from '@prisma/client';

import logger from '../../../lib/logger.js';
import { showMainMenu } from '../../../menus/main-menu.js';
import { mealDescriptionProcessor } from '../../callbacks/meal-menu/services/meal-description-processor.js';

export const mealDescription = async (ctx: MyContext, db: PrismaClient) => {
  if (!ctx.message || !ctx.message.text) {
    return;
  }

  if (!ctx.session.mealType) {
    await ctx.reply(
      'Будь ласка, спочатку виберіть тип прийому їжі. Використайте меню для вибору.'
    );
  }

  if (!ctx.from) {
    await ctx.reply('Не вдалося отримати інформацію про користувача.');
    return;
  }

  const mealDescription = ctx.message.text;
  const mealType = ctx.session.mealType as MealType;

  const userId = ctx.from.id.toString();

  ctx.session.waitingFor = undefined;
  ctx.session.mealType = undefined;

  try {
    await ctx.reply('Аналізую ваш прийом їжі, будь ласка, зачекайте...');

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
  } finally {
    await showMainMenu(ctx);
  }
};
