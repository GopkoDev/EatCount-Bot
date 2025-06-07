import type { MyContext } from '../../../types.js';
import type { PrismaClient } from '@prisma/client/extension';

import logger from '../../../lib/logger.js';
import { handleEditMeal } from '../../callbacks/edit-meals-menu/services/edit-meal-service.js';

export const editMealDescriptionHandler = async (
  ctx: MyContext,
  db: PrismaClient
) => {
  if (!ctx.message || !ctx.message.text || !ctx.from || !ctx.from.id) {
    return;
  }

  const newDescription = ctx.message.text.trim();
  const userId = ctx.from.id.toString();
  const mealId = ctx.session.editMealId;

  ctx.session.waitingFor = undefined;

  if (!mealId) {
    await ctx.reply('Помилка: прийом їжі не знайдено для редагування');
    return;
  }

  try {
    await db.meal.updateMany({
      where: {
        id: mealId,
        user: {
          telegramId: userId,
        },
      },
      data: {
        description: newDescription,
      },
    });

    await ctx.reply('✅ Опис прийому їжі успішно оновлено');

    await handleEditMeal(ctx, db, mealId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Невідома помилка';
    logger.error(
      `Error updating meal description for user ${userId}: ${errorMessage}`,
      error
    );
    await ctx.reply(
      'Сталася помилка при оновленні опису. Будь ласка, спробуйте пізніше.'
    );
  }
};
