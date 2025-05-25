import type { MealType } from '@prisma/client';
import type { PrismaClient } from '@prisma/client/extension';

import { config } from '../../../../../envconfig.js';
import { mocFoods, mocUsage } from '../data/moc.js';

import { getUserFromDb } from '../../../../helpers/get-user-from-db.js';
import { processAiDescription } from '../helpers/ai-description-processing.js';
import { fatSecretDbProcessor } from '../helpers/fatsecret-db-processor.js';
import { formatAnswer } from '../helpers/format-answer.js';
import { nutritionFatsecret } from '../helpers/nutrition-fatsecret-data.js';
import { writeToDb } from '../helpers/write-meal-to-db.js';

const manualDisableMoc = false;
const isMoc = config.server.nodeEnv === 'development' && !manualDisableMoc;

interface MealDescriptionProcessorParams {
  db: PrismaClient;
  mealDescription: string;
  mealType: MealType;
  userId: string;
}

export const mealDescriptionProcessor = async ({
  db,
  mealDescription,
  mealType,
  userId,
}: MealDescriptionProcessorParams): Promise<string> => {
  const user = await getUserFromDb(userId, db);

  const { processedFoods, usage } = isMoc
    ? { processedFoods: mocFoods, usage: mocUsage }
    : await processAiDescription({
        query: mealDescription,
      });

  const { validFoods, failedFoods } = await nutritionFatsecret(processedFoods);

  const preparedForDb = fatSecretDbProcessor(validFoods, mealType);

  const nutritionMessage = formatAnswer(preparedForDb, failedFoods);

  await writeToDb({
    db,
    meal: preparedForDb,
    user,
    failedFoods,
    aiApiUsage: usage,
  });

  return nutritionMessage;
};
