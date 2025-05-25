import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import type { MealType, PrismaClient } from '@prisma/client';

import { getUserFromDb } from '../../../helpers/get-user-from-db.js';
import { processAiDescription } from './helpers/ai-description-processing.js';
import { nutritionFatsecret } from './helpers/nutrition-fatsecret-data.js';
import { mocFoods, mocUsage } from './moc.js';
import logger from '../../../lib/logger.js';
import { fatSecretDbProcessor } from './helpers/fatsecret-db-processor.js';
import { formatAnswer } from './helpers/format-answer.js';
import { writeToDb } from './helpers/write-meal-to-db.js';
import { config } from '../../../../envconfig.js';

const manualDisableMoc = false;
const isMoc = config.server.nodeEnv === 'development' && !manualDisableMoc;

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
        const user = await getUserFromDb(userId, db);

        const { processedFoods, usage } = isMoc
          ? { processedFoods: mocFoods, usage: mocUsage }
          : await processAiDescription({
              query: mealDescription,
            });

        const { validFoods, failedFoods } = await nutritionFatsecret(
          processedFoods
        );

        const preparedForDb = fatSecretDbProcessor(validFoods, mealType);

        const nutritionMessage = formatAnswer(preparedForDb, failedFoods);
        await ctx.reply(nutritionMessage, { parse_mode: 'Markdown' });

        await writeToDb({
          db,
          meal: preparedForDb,
          user,
          failedFoods,
          aiApiUsage: usage,
        });
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
    }
  });
};
