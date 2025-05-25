import { Bot, InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';
import { showMealTypesMenu } from './meal-menus.js';

export const showMainMenu = async (ctx: MyContext) => {
  const keyboard = new InlineKeyboard()
    .text('🍴 Додати прийом їжі', 'add_meal')
    .row()
    .text('📊 Статистика', 'statistics')
    .row()
    .text('⚙️ Налаштування', 'settings')
    .row()
    .text('🚀 Розширена статистика на сайті', 'go_to_site');

  await ctx.reply('Головне меню:', { reply_markup: keyboard });
};

export const mainMenuCallbacks = (bot: Bot<MyContext>) => {
  bot.callbackQuery('add_meal', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showMealTypesMenu(ctx);
  });
};
