import type { MealItem, User } from '@prisma/client';
import type { preparedForDb } from './fatsecret-db-processor.js';
import type { ApiFaildFood } from './nutrition-fatsecret-data.js';
import type { usageAiApiType } from './ai-description-processing.js';
import type { PrismaClient } from '@prisma/client/extension';

interface WriteMealToDbParams {
  db: PrismaClient;
  meal: preparedForDb[];
  user: User;
  failedFoods: ApiFaildFood[];
  aiApiUsage: usageAiApiType;
}

export const writeToDb = async ({
  db,
  meal,
  user,
  failedFoods,
  aiApiUsage,
}: WriteMealToDbParams): Promise<void> => {
  try {
    await db.$transaction(async (tx: PrismaClient) => {
      for (const mealEntry of meal as preparedForDb[]) {
        const createdMeal: { id: number } = await tx.meal.create({
          data: {
            userId: user.id,
            type: mealEntry.meal.type,
            timestamp: new Date(),
            description: mealEntry.meal.description,
            totalCalories: mealEntry.meal.totalCalories,
            totalProtein: mealEntry.meal.totalProtein,
            totalFat: mealEntry.meal.totalFat,
            totalCarbs: mealEntry.meal.totalCarbs,
            items: {
              create: mealEntry.items.map((item: MealItem) => ({
                name: item.name,
                amountGrams: item.amountGrams,
                calories: item.calories,
                protein: item.protein,
                fat: item.fat,
                carbs: item.carbs,
                saturatedFat: item.saturatedFat,
                polyunsaturatedFat: item.polyunsaturatedFat,
                monounsaturatedFat: item.monounsaturatedFat,
                cholesterol: item.cholesterol,
                sodium: item.sodium,
                potassium: item.potassium,
                fiber: item.fiber,
                sugar: item.sugar,
                vitaminA: item.vitaminA,
                vitaminC: item.vitaminC,
                calcium: item.calcium,
                iron: item.iron,
                transFat: item.transFat,
                addedSugars: item.addedSugars,
                vitaminD: item.vitaminD,
              })),
            },
          },
        });
      }

      if (failedFoods.length > 0) {
        await tx.faildSearchByFatSecretApi.createMany({
          data: failedFoods.map((failedFood: ApiFaildFood) => ({
            userId: user.id,
            name: failedFood.food.name,
            weight: failedFood.food.weight,
            query: failedFood.food.query,
            additionalTerms: failedFood.food.additionalTerms,
            excludeTerms: failedFood.food.excludeTerms,
            errorMessage: failedFood.error,
          })),
        });
      }

      await tx.apiRequestLog.create({
        data: {
          userId: user.id,
          model: aiApiUsage.model,
          promptTokens: aiApiUsage.promptTokens,
          completionTokens: aiApiUsage.completionTokens,
          totalTokens: aiApiUsage.totalTokens,
          queryText: aiApiUsage.queryText,
        },
      });
    });
  } catch (error) {
    console.error('Error writing meal to database:', error);
    throw new Error('Failed to write meal to database');
  }
};
