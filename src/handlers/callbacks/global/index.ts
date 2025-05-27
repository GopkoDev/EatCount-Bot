import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import { showMainMenu } from '../../../menus/main-menu.js';

export const globalCallbacks = (bot: Bot<MyContext>) => {
  bot.callbackQuery('back_to_main_menu', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showMainMenu(ctx);
  });
};
