import type { PrismaClient } from '@prisma/client';
import type { MyContext } from '../../../../types.js';
import { getUserFromDb } from '../../../../helpers/get-user-from-db.js';
import {
  getRangeByKeyType,
  getAllDatesInWeek,
  timeZone,
  formatDateToKey,
} from '../helpers/get-time-ranges.js';

type KeyType = 'stats_this_week' | 'stats_last_week';

export const statsWeekService = async (
  ctx: MyContext,
  db: PrismaClient,
  key: KeyType
) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    await ctx.reply(
      'Не вдалося отримати ваш ідентифікатор користувача. Використовуйте команду /start для повторної ініціалізації.'
    );
    return;
  }

  const user = await getUserFromDb(userId, db);

  const { startOfWeekUTC, endOfWeekUTC, weekRangeKyiv } =
    getRangeByKeyType(key);

  if (!startOfWeekUTC || !endOfWeekUTC) {
    throw new Error('[WEEK STATS] Invalid date range');
  }

  try {
    const meals = await db.meal.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: startOfWeekUTC,
          lt: endOfWeekUTC,
        },
      },
      include: {
        items: true,
      },
    });

    if (meals.length === 0) {
      await ctx.reply('За цей тиждень ви ще не додали жодного прийому їжі.');
      return;
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    const dailyStats: Record<
      string,
      { calories: number; protein: number; fat: number; carbs: number }
    > = {};

    meals.forEach((meal) => {
      totalCalories += meal.totalCalories;
      totalProtein += meal.totalProtein;
      totalFat += meal.totalFat;
      totalCarbs += meal.totalCarbs;

      const dateKey = formatDateToKey(meal.timestamp);
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { calories: 0, protein: 0, fat: 0, carbs: 0 };
      }
      dailyStats[dateKey].calories += meal.totalCalories;
      dailyStats[dateKey].protein += meal.totalProtein;
      dailyStats[dateKey].fat += meal.totalFat;
      dailyStats[dateKey].carbs += meal.totalCarbs;
    });

    const proteinCalories = totalProtein * 4;
    const fatCalories = totalFat * 9;
    const carbCalories = totalCarbs * 4;

    const proteinPercentage = ((proteinCalories / totalCalories) * 100).toFixed(
      1
    );
    const fatPercentage = ((fatCalories / totalCalories) * 100).toFixed(1);
    const carbPercentage = ((carbCalories / totalCalories) * 100).toFixed(1);

    const allDates = getAllDatesInWeek(startOfWeekUTC);

    const fullDailyMessages = allDates.map((date) => {
      if (dailyStats[date]) {
        const { calories, protein, fat, carbs } = dailyStats[date];
        return `📅 ${new Date(date).toLocaleDateString('uk-UA', {
          day: '2-digit',
          month: 'long',
        })}: ⚡: ${calories.toFixed(1)} | 🥩: ${protein.toFixed(
          1
        )} г | 🧈: ${fat.toFixed(1)} г | 🍞: ${carbs.toFixed(1)} г`;
      } else {
        return `📅 ${new Date(date).toLocaleDateString('uk-UA', {
          day: '2-digit',
          month: 'long',
        })}: Відсутні прийоми їжі`;
      }
    });

    const message =
      `📅 Статистика за тиждень (${weekRangeKyiv}):\n\n` +
      `⚡ Калорії: ${totalCalories.toFixed(1)} ккал\n` +
      `🥩 Білки: ${totalProtein.toFixed(1)} г  (${proteinPercentage}%)\n` +
      `🧈 Жири: ${totalFat.toFixed(1)} г  (${fatPercentage}%)\n` +
      `🍞 Вуглеводи: ${totalCarbs.toFixed(1)} г  (${carbPercentage}%)\n\n` +
      fullDailyMessages.join('\n');

    await ctx.reply(message);
  } catch (error) {
    console.error('Error fetching weekly statistics:', error);
    await ctx.reply(
      'Сталася помилка при отриманні статистики за тиждень. Спробуйте пізніше.'
    );
  }
};
