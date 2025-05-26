import type { PrismaClient, MealType } from '@prisma/client';
import type { MyContext } from '../../../../types.js';
import type { Meal, MealItem } from '@prisma/client';
import { getUserFromDb } from '../../../../helpers/get-user-from-db.js';
import { getTodayRangeUTC } from '../helpers/get-time-ranges.js';
import { translateMealTypeToUkrainian } from '../../../../helpers/meal-type-translator.js';

interface MealWithItems extends Meal {
  items: MealItem[];
}

export const statsTodayService = async (ctx: MyContext, db: PrismaClient) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    throw new Error('[STATS TODAY] User ID not found');
  }

  const user = await getUserFromDb(userId, db);

  const { startOfDayUTC, endOfDayUTC, dayAndMonthKyiv } = getTodayRangeUTC();

  if (!startOfDayUTC || !endOfDayUTC) {
    throw new Error('[TOODAY STATS] Invalid date range');
  }

  try {
    const startOfDay = new Date(startOfDayUTC);
    const endOfDay = new Date(endOfDayUTC);

    const meals = (await db.meal.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        items: true,
      },
    })) as MealWithItems[];

    if (meals.length === 0) {
      await ctx.reply('Сьогодні ви ще не додали жодного прийому їжі.');
      return;
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalCholesterol = 0;

    const mealTypeStats: Partial<
      Record<
        MealType,
        { calories: number; protein: number; fat: number; carbs: number }
      >
    > = {};

    meals.forEach((meal: MealWithItems) => {
      totalCalories += meal.totalCalories;
      totalProtein += meal.totalProtein;
      totalFat += meal.totalFat;
      totalCarbs += meal.totalCarbs;

      meal.items.forEach((item) => {
        totalFiber += item.fiber || 0;
        totalSugar += item.sugar || 0;
        totalSodium += item.sodium || 0;
        totalCholesterol += item.cholesterol || 0;
      });

      const mealType = meal.type;
      if (!mealTypeStats[mealType]) {
        mealTypeStats[mealType] = { calories: 0, protein: 0, fat: 0, carbs: 0 };
      }

      mealTypeStats[mealType]!.calories += meal.totalCalories;
      mealTypeStats[mealType]!.protein += meal.totalProtein;
      mealTypeStats[mealType]!.fat += meal.totalFat;
      mealTypeStats[mealType]!.carbs += meal.totalCarbs;
    });

    const mealTypeDetails = Object.entries(mealTypeStats)
      .filter(([_, stats]) => stats && stats.calories > 0)
      .map(([type, stats]) => {
        return `🍽 ${translateMealTypeToUkrainian(
          type as MealType
        )}: ⚡: ${stats.calories.toFixed(1)} | 🥩: ${stats.protein.toFixed(
          1
        )} г | 🧈: ${stats.fat.toFixed(1)} г | 🍞: ${stats.carbs.toFixed(1)} г`;
      })
      .join('\n');

    const proteinCalories = totalProtein * 4;
    const fatCalories = totalFat * 9;
    const carbCalories = totalCarbs * 4;

    const proteinPercentage =
      totalCalories > 0
        ? ((proteinCalories / totalCalories) * 100).toFixed(1)
        : '0.0';
    const fatPercentage =
      totalCalories > 0
        ? ((fatCalories / totalCalories) * 100).toFixed(1)
        : '0.0';
    const carbPercentage =
      totalCalories > 0
        ? ((carbCalories / totalCalories) * 100).toFixed(1)
        : '0.0';

    const message =
      `📆 Сьогодні, ${dayAndMonthKyiv}\n\n` +
      `⚡ Калорії: ${totalCalories.toFixed(1)} ккал\n` +
      `🥩 Білки: ${totalProtein.toFixed(1)} г  (${proteinPercentage}%)\n` +
      `🧈 Жири: ${totalFat.toFixed(1)} г  (${fatPercentage}%)\n` +
      `🍞 Вуглеводи: ${totalCarbs.toFixed(1)} г  (${carbPercentage}%)\n` +
      `🥦 Клітковина: ${totalFiber.toFixed(1)} г\n` +
      `🍭 Цукор: ${totalSugar.toFixed(1)} г\n` +
      `🧂 Натрій: ${totalSodium.toFixed(0)} мг\n` +
      `🩸 Холестерин: ${totalCholesterol.toFixed(0)} мг\n\n` +
      `Деталі по типам прийомів їжі:\n${mealTypeDetails}`;

    await ctx.reply(message);
  } catch (error) {
    console.error("Error fetching today's statistics:", error);
    await ctx.reply(
      'Сталася помилка при отриманні статистики. Спробуйте пізніше.'
    );
  }
};
