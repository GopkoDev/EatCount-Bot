import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import { showMealTypesMenu } from '../../../menus/meal-menu.js';
import { showStatisticsMenu } from '../../../menus/statistics-variants-menu.js';

export const mainMenuCallbacks = (bot: Bot<MyContext>) => {
  bot.callbackQuery('add_meal', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showMealTypesMenu(ctx);
  });

  bot.callbackQuery('statistics', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showStatisticsMenu(ctx);
  });
};
