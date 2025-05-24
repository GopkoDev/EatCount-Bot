import { Bot, InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';

export const showMealTypesMenu = async (ctx: MyContext) => {
  const keyboard = new InlineKeyboard()
    .text('Сніданок', 'BREAKFAST')
    .row()
    .text('Обід', 'LUNCH')
    .row()
    .text('Вечеря', 'DINNER')
    .row()
    .text('Перекус', 'SNACK');

  await ctx.reply('Оберіть тип прийому їжі:', { reply_markup: keyboard });
};
