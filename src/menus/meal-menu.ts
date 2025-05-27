import { InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';

export const showMealTypesMenu = async (ctx: MyContext) => {
  const keyboard = new InlineKeyboard()
    .text('🍳 Сніданок', 'BREAKFAST')
    .row()
    .text('🍝 Обід', 'LUNCH')
    .row()
    .text('🍽️ Вечеря', 'DINNER')
    .row()
    .text('🍌 Перекус', 'SNACK')
    .row()
    .text('↩️ До головного меню', 'back_to_main_menu');

  await ctx.reply('Оберіть тип прийому їжі:', { reply_markup: keyboard });
};
