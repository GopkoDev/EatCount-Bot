import { InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';
import type { Meal, MealType } from '@prisma/client';
import { translateMealTypeToUkrainian } from '../helpers/meal-type-translator.js';
import { DateTime } from 'luxon';

const formatMealDate = (date: Date): string => {
  return DateTime.fromJSDate(date)
    .setZone('Europe/Kiev')
    .setLocale('uk')
    .toFormat('dd.MM.yyyy HH:mm');
};

export const showEditMealsMenu = async (ctx: MyContext) => {
  const keyboard = new InlineKeyboard()
    .text('🕒 Сьогоднішні прийоми їжі', 'edit_today_meals')
    .row()
    .text('📜 Останні прийоми', 'edit_recent_meals')
    .row()
    .text('↩️ До головного меню', 'back_to_main_menu');

  await ctx.reply('Оберіть, які прийоми їжі ви бажаєте редагувати:', {
    reply_markup: keyboard,
  });
};

export const showMealsList = async (
  ctx: MyContext,
  meals: Meal[],
  page: number = 0,
  isLastPage: boolean = false
) => {
  if (meals.length === 0) {
    const keyboard = new InlineKeyboard().text(
      '↩️ До меню редагування',
      'back_to_edit_menu'
    );

    await ctx.reply('Прийоми їжі не знайдені', { reply_markup: keyboard });
    return;
  }

  const ITEMS_PER_PAGE = 10;
  const startIdx = page * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, meals.length);
  const currentMeals = meals.slice(startIdx, endIdx);

  const keyboard = new InlineKeyboard();

  for (const meal of currentMeals) {
    const mealDate = formatMealDate(meal.timestamp);
    const mealType = translateMealTypeToUkrainian(meal.type as MealType);
    const mealDescription = meal.description || 'Без опису';
    keyboard
      .text(
        `${mealType}: ${mealDate} ${mealDescription}`,
        `edit_meal_${meal.id}`
      )
      .row();
  }

  if (page > 0 || !isLastPage) {
    if (page > 0) {
      keyboard.text('⬅️ Попередня', `prev_page_${page - 1}`);
    }

    if (!isLastPage) {
      keyboard.text('Наступна ➡️', `next_page_${page + 1}`);
    }

    keyboard.row();
  }

  keyboard.text('↩️ До меню редагування', 'back_to_edit_menu');

  await ctx.reply(
    `Оберіть прийом їжі для редагування (сторінка ${page + 1}):`,
    { reply_markup: keyboard }
  );
};

export const showEditMealMenu = async (ctx: MyContext, meal: Meal) => {
  const mealDate = formatMealDate(meal.timestamp);
  const mealType = translateMealTypeToUkrainian(meal.type as MealType);

  const keyboard = new InlineKeyboard()
    .text('✏️ Змінити опис', `edit_description_${meal.id}`)
    .row()
    .text('🔄 Змінити тип', `change_type_${meal.id}`)
    .row()
    .text('🗑️ Видалити прийом їжі', `delete_meal_${meal.id}`)
    .row()
    .text('↩️ Назад до списку', 'back_to_meals_list');

  await ctx.reply(
    `Редагування прийому їжі:\n${mealType}, ${mealDate}\n"${meal.description}"`,
    { reply_markup: keyboard }
  );
};

export const showChangeMealTypeMenu = async (
  ctx: MyContext,
  mealId: string
) => {
  const keyboard = new InlineKeyboard()
    .text('🍳 Сніданок', `set_type_BREAKFAST_${mealId}`)
    .row()
    .text('🍝 Обід', `set_type_LUNCH_${mealId}`)
    .row()
    .text('🍽️ Вечеря', `set_type_DINNER_${mealId}`)
    .row()
    .text('🍌 Перекус', `set_type_SNACK_${mealId}`)
    .row()
    .text('↩️ Назад', `back_to_edit_meal_${mealId}`);

  await ctx.reply('Оберіть новий тип прийому їжі:', { reply_markup: keyboard });
};

export const confirmMealDeletion = async (ctx: MyContext, mealId: string) => {
  const keyboard = new InlineKeyboard()
    .text('✅ Так, видалити', `confirm_delete_meal_${mealId}`)
    .row()
    .text('❌ Ні, скасувати', `back_to_edit_meal_${mealId}`);

  await ctx.reply(
    `Ви впевнені, що хочете видалити прийом їжі? Ця дія не може бути скасована.`,
    { reply_markup: keyboard }
  );
};
