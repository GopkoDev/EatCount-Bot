import { Bot, InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';

export const showMealTypesMenu = async (ctx: MyContext) => {
  const keyboard = new InlineKeyboard()
    .text('Сніданок', 'meal_breakfast')
    .row()
    .text('Обід', 'meal_lunch')
    .row()
    .text('Вечеря', 'meal_dinner')
    .row()
    .text('Перекус', 'meal_snack');

  await ctx.reply('Оберіть тип прийому їжі:', { reply_markup: keyboard });
};
