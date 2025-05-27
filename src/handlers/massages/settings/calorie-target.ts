import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import type { PrismaClient } from '@prisma/client/extension';

import logger from '../../../lib/logger.js';
import { getUserFromDb } from '../../../helpers/get-user-from-db.js';
import { showMainMenu } from '../../../menus/main-menu.js';
import { showSettingsMenu } from '../../../menus/settings-menu.js';

export const calorieTargetHandler = async (
  ctx: MyContext,
  db: PrismaClient
) => {
  if (!ctx.message || !ctx.message.text || !ctx.from || !ctx.from.id) {
    return;
  }

  const inputText = ctx.message.text.trim();
  const userId = ctx.from.id.toString();

  ctx.session.waitingFor = undefined;

  const calorieTarget = parseInt(inputText);

  if (isNaN(calorieTarget)) {
    await ctx.reply(
      'Будь ласка, введіть дійсне число для цілі по калоріях, або 0 щоб видалити ціль.'
    );
    await showSettingsMenu(ctx);
    return;
  }

  if (calorieTarget < 0) {
    await ctx.reply(
      "Будь ласка, введіть невід'ємне число для цілі по калоріях, або 0 щоб видалити ціль."
    );
    await showSettingsMenu(ctx);
    return;
  }

  if (calorieTarget > 10000) {
    await ctx.reply(
      'Значення цілі занадто велике. Будь ласка, введіть реалістичне значення (до 10000 ккал).'
    );
    await showSettingsMenu(ctx);
    return;
  }

  if (calorieTarget === 0) {
    try {
      const user = await getUserFromDb(userId, db);

      const existingTarget = await db.target.findUnique({
        where: { userId: user.id },
      });

      if (existingTarget) {
        await db.target.delete({
          where: { userId: user.id },
        });

        await ctx.reply('✅ Вашу ціль по калоріях успішно видалено.');
      } else {
        await ctx.reply('У вас не встановлено цілі по калоріях.');
      }

      await showMainMenu(ctx);
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Невідома помилка';
      logger.error(
        `Error deleting calorie target for user ${userId}: ${errorMessage}`,
        error
      );
      await ctx.reply(
        'Сталася помилка при видаленні цілі. Будь ласка, спробуйте пізніше.'
      );
      await showMainMenu(ctx);
      return;
    }
  }

  try {
    const user = await getUserFromDb(userId, db);

    await db.target.upsert({
      where: {
        userId: user.id,
      },
      update: {
        calorieTarget,
      },
      create: {
        userId: user.id,
        calorieTarget,
      },
    });

    await ctx.reply(
      `✅ Ціль по калоріях встановлена на ${calorieTarget} ккал на день.`
    );
    await showMainMenu(ctx);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Невідома помилка';
    logger.error(
      `Error setting calorie target for user ${userId}: ${errorMessage}`,
      error
    );
    await ctx.reply(
      'Сталася помилка при встановленні цілі. Будь ласка, спробуйте пізніше.'
    );
    await showMainMenu(ctx);
  }
};
