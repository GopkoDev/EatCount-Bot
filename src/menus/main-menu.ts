import { InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';

export const showMainMenu = async (ctx: MyContext) => {
  const keyboard = new InlineKeyboard()
    .text('🍴 Додати прийом їжі', 'add_meal')
    .row()
    .text('📊 Статистика', 'statistics')
    .row()
    .text('🔄 Редагувати', 'edit_meals')
    .row()
    .text('⚙️ Налаштування', 'settings')
    .row()
    .text('🚀 Розширена статистика на сайті', 'go_to_site');

  await ctx.reply('Головне меню:', { reply_markup: keyboard });
};
