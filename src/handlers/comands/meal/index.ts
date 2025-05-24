import { Bot } from 'grammy';
import type { PrismaClient, MealType } from '@prisma/client';
import type { MyContext } from '../../../types.js';
import { showMealTypesMenu } from '../../../menus/meal-menus.js';

export const mealCommand = (bot: Bot<MyContext>, db: PrismaClient) => {
  bot.command('meal', async (ctx) => {
    await showMealTypesMenu(ctx);
  });

  bot.callbackQuery('BREAKFAST', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForMealDescription(ctx, 'BREAKFAST');
  });

  bot.callbackQuery('LUNCH', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForMealDescription(ctx, 'LUNCH');
  });

  bot.callbackQuery('DINNER', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForMealDescription(ctx, 'DINNER');
  });

  bot.callbackQuery('SNACK', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForMealDescription(ctx, 'SNACK');
  });

  // user's meal description was registered in meal-description.ts
};

const askForMealDescription = async (ctx: MyContext, mealType: MealType) => {
  let mealTypeText;
  switch (mealType) {
    case 'BREAKFAST':
      mealTypeText = 'Сніданок';
      break;
    case 'LUNCH':
      mealTypeText = 'Обід';
      break;
    case 'DINNER':
      mealTypeText = 'Вечеря';
      break;
    case 'SNACK':
      mealTypeText = 'Перекус';
      break;
  }

  ctx.session.waitingFor = 'meal_description';
  ctx.session.mealType = mealType;

  await ctx.reply(
    `Будь ласка, опишіть детально що ви з'їли на ${mealTypeText.toLowerCase()}:`
  );
};
