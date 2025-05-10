import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import type { PrismaClient } from '@prisma/client';

import {
  getNutritionData,
  type NutritionData,
} from '../../../helpers/get-nutrition-data.js';
import logger from '../../../lib/logger.js';

export const mealDescription = (bot: Bot<MyContext>, db: PrismaClient) => {
  bot.on('message:text', async (ctx) => {
    if (ctx.session.waitingFor === 'meal_description' && ctx.session.mealType) {
      const mealDescription = ctx.message.text;
      const mealType = ctx.session.mealType;

      ctx.session.waitingFor = undefined;
      ctx.session.mealType = undefined;

      await ctx.reply('Аналізую ваш прийом їжі, будь ласка, зачекайте...');

      try {
        const user = await db.user.findUnique({
          where: {
            telegramId: ctx.from.id.toString(),
          },
        });

        if (!user) {
          logger.error('User not found');
          throw new Error('User not found');
        }

        const nutritionData = await getNutritionData(mealDescription);

        if (nutritionData) {
          const meal = await db.meal.create({
            data: {
              userId: user.id,
              type: mealType,
              description: mealDescription,
            },
          });

          await db.nutritionData.create({
            data: {
              mealId: meal.id,
              totalCalories: nutritionData.totalCalories,
              protein: nutritionData.protein,
              fat: nutritionData.fat,
              carbs: nutritionData.carbs,
              fiber: nutritionData.fiber,
              sugar: nutritionData.sugar,
              saturatedFat: nutritionData.saturatedFat,
              polyunsaturatedFat: nutritionData.polyunsaturatedFat,
              monounsaturatedFat: nutritionData.monounsaturatedFat,
              cholesterol: nutritionData.cholesterol,
              vitamins: nutritionData.vitamins,
              ingredients: nutritionData.ingredients,
            },
          });

          const nutritionMessage = formatNutritionMessage(
            nutritionData,
            mealType
          );

          await ctx.reply(nutritionMessage, { parse_mode: 'Markdown' });
        } else {
          logger.error('Error getting nutrition data:');
          await ctx.reply(
            `При опрацюванні вашого прийому їжі виникла помилка. Спробуйте ще раз через декілька хвилин.`
          );
        }
      } catch (error) {
        logger.error('Error saving meal:', error);
        await ctx.reply(
          'Виникла помилка при збереженні прийому їжі. Спробуйте ще раз.'
        );
      }
    }
  });

  function formatNutritionMessage(
    nutritionData: NutritionData,
    mealType: string
  ) {
    let ingredientsText = '';
    if (nutritionData.ingredients && nutritionData.ingredients.length > 0) {
      nutritionData.ingredients.forEach((ingredient) => {
        ingredientsText += `- ${ingredient}\n`;
      });
    }

    const notice =
      '_Примітка: Це наближена оцінка харчової цінності, яка може відрізнятися від фактичних значень._';

    return `*Ваш ${mealType.toLowerCase()} записано і проаналізовано*
  
*Харчова цінність:*
- Загальна калорійність: ${nutritionData.totalCalories} ккал
- Білки: ${nutritionData.protein} г
- Жири: ${nutritionData.fat} г
- Вуглеводи: ${nutritionData.carbs} г
- Клітковина: ${nutritionData.fiber} г
- Цукор: ${nutritionData.sugar} г
- Насичені жири: ${nutritionData.saturatedFat} г
- Поліненасичені жири: ${nutritionData.polyunsaturatedFat} г
- Мононенасичені жири: ${nutritionData.monounsaturatedFat} г
- Холестерин: ${nutritionData.cholesterol} мг

${ingredientsText ? `*Інгредієнти:*` : ''} 
${ingredientsText ? ingredientsText : ''}

${notice}`;
  }
};
