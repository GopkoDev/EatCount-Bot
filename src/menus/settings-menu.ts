import { InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';

export const showSettingsMenu = async (ctx: MyContext) => {
  const keyboard = new InlineKeyboard()
    .text('🎯 Ціль по калоріях', 'set_calorie_target')
    .row()
    .text('↩️ Повернутись', 'back_to_main_menu');

  await ctx.reply('Налаштування:', { reply_markup: keyboard });
};
