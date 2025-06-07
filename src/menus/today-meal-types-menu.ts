import { InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';
import type { MealType } from '@prisma/client';
import { translateMealTypeToUkrainian } from '../helpers/meal-type-translator.js';

export const showTodayMealTypes = async (
  ctx: MyContext,
  mealTypes: MealType[]
) => {
  if (mealTypes.length === 0) {
    const keyboard = new InlineKeyboard().text(
      '↩️ До меню редагування',
      'back_to_edit_menu'
    );

    await ctx.reply('Сьогодні ще не було додано прийомів їжі', {
      reply_markup: keyboard,
    });
    return;
  }

  const keyboard = new InlineKeyboard();

  mealTypes.forEach((mealType) => {
    const translatedType = translateMealTypeToUkrainian(mealType);
    keyboard
      .text(
        `${getEmojiForMealType(mealType)} ${translatedType}`,
        `edit_today_${mealType}`
      )
      .row();
  });

  keyboard.text('↩️ До меню редагування', 'back_to_edit_menu');

  await ctx.reply('Виберіть тип прийому їжі для редагування:', {
    reply_markup: keyboard,
  });
};

function getEmojiForMealType(mealType: MealType): string {
  switch (mealType) {
    case 'BREAKFAST':
      return '🍳';
    case 'LUNCH':
      return '🍝';
    case 'DINNER':
      return '🍽️';
    case 'SNACK':
      return '🍌';
    default:
      return '🍴';
  }
}
