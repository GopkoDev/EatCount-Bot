import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import { showMealTypesMenu } from '../../../menus/meal-menu.js';

export const mainMenuCallbacks = (bot: Bot<MyContext>) => {
  bot.callbackQuery('add_meal', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showMealTypesMenu(ctx);
  });
};
