import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import type { PrismaClient } from '@prisma/client/extension';
import { showMainMenu } from '../../../menus/main-menu.js';
import { getUserFromDb } from '../../../helpers/get-user-from-db.js';
import logger from '../../../lib/logger.js';

export const settingsMenuCallbacks = (
  bot: Bot<MyContext>,
  db: PrismaClient
) => {
  bot.callbackQuery('set_calorie_target', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForCaloriesTarget(ctx, db);
  });
};

const askForCaloriesTarget = async (ctx: MyContext, db: PrismaClient) => {
  if (!ctx.from || !ctx.from.id) {
    throw new Error('User ID not found in context');
  }

  const userId = ctx.from.id.toString();

  try {
    const user = await getUserFromDb(userId, db);

    const existingTarget = await db.target.findFirst({
      where: { userId: user.id },
    });

    let message;

    if (existingTarget) {
      message = `Ваша поточна ціль: ${existingTarget.calorieTarget} ккал на день.\nЩоб змінити ціль, введіть нове значення.\nЩоб видалити ціль, введіть 0.`;
    } else {
      message =
        'Щоб встановити денну ціль по калоріях, введіть бажану кількість калорій (наприклад: 2000).\nЩоб скасувати, введіть 0.';
    }

    ctx.session.waitingFor = 'calorie_target';

    await ctx.reply(message);
  } catch (error) {
    logger.error(`Error fetching user settings for user ${userId}:`, error);
    await ctx.reply(
      'Сталася помилка при отриманні налаштувань. Спробуйте ще раз.'
    );
    await showMainMenu(ctx);
  }
};
