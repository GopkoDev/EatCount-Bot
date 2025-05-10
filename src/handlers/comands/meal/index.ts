import { Bot } from 'grammy';
import type { PrismaClient } from '@prisma/client';
import type { MyContext } from '../../../types.js';
import { showMealTypesMenu } from '../../../menus/meal-menus.js';

export const mealCommand = (bot: Bot<MyContext>, db: PrismaClient) => {
  bot.command('meal', async (ctx) => {
    await showMealTypesMenu(ctx);
  });

  bot.callbackQuery('meal_breakfast', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForMealDescription(ctx, 'Сніданок');
  });

  bot.callbackQuery('meal_lunch', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForMealDescription(ctx, 'Обід');
  });

  bot.callbackQuery('meal_dinner', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForMealDescription(ctx, 'Вечеря');
  });

  bot.callbackQuery('meal_snack', async (ctx) => {
    await ctx.answerCallbackQuery();
    await askForMealDescription(ctx, 'Перекус');
  });

  // user's meal description was registered in meal-description.ts
};

async function askForMealDescription(ctx: MyContext, mealType: string) {
  ctx.session.waitingFor = 'meal_description';
  ctx.session.mealType = mealType;

  await ctx.reply(
    `Будь ласка, опишіть що ви з'їли на ${mealType.toLowerCase()}:`
  );
}
