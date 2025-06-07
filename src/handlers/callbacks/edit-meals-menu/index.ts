import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import type { PrismaClient, MealType } from '@prisma/client';

import { showMainMenu } from '../../../menus/main-menu.js';
import { showEditMealsMenu } from '../../../menus/edit-meals-menu.js';
import {
  handleEditMeal,
  handleChangeMealType,
  handleSetMealType,
  handleDeleteMeal,
  handleConfirmDeleteMeal,
  handleEditMealDescription,
  handleBackToMealsList,
} from './services/edit-meal-service.js';
import {
  showTodayMeals,
  showTodayMealsByType,
  showRecentMeals,
  handlePagination,
} from './services/meal-listing-service.js';

export const editMealsMenuCallbacks = (
  bot: Bot<MyContext>,
  db: PrismaClient
) => {
  bot.callbackQuery('edit_meals', async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editPage;
    ctx.session.editMealId = undefined;
    ctx.session.editItemId = undefined;
    await showEditMealsMenu(ctx);
  });

  bot.callbackQuery('back_to_edit_menu', async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editPage = 0;
    await showEditMealsMenu(ctx);
  });

  bot.callbackQuery('back_to_main_menu', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showMainMenu(ctx);
  });

  bot.callbackQuery('edit_today_meals', async (ctx) => {
    await ctx.answerCallbackQuery();
    await showTodayMeals(ctx, db);
  });

  bot.callbackQuery('edit_recent_meals', async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editPage = 0;
    await showRecentMeals(ctx, db);
  });

  bot.callbackQuery(
    /^edit_today_(BREAKFAST|LUNCH|DINNER|SNACK)$/,
    async (ctx) => {
      await ctx.answerCallbackQuery();
      const mealType = ctx.match?.[1];
      if (mealType) {
        await showTodayMealsByType(ctx, db, mealType as MealType);
      }
    }
  );

  bot.callbackQuery(/^prev_page_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const pageStr = ctx.match?.[1];
    if (pageStr) {
      const page = parseInt(pageStr);
      await handlePagination(ctx, db, page);
    }
  });

  bot.callbackQuery(/^next_page_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const pageStr = ctx.match?.[1];
    if (pageStr) {
      const page = parseInt(pageStr);
      await handlePagination(ctx, db, page);
    }
  });

  bot.callbackQuery(/^edit_meal_([0-9a-f-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const mealId = ctx.match?.[1];
    if (mealId) {
      await handleEditMeal(ctx, db, mealId);
    }
  });

  bot.callbackQuery(/^change_type_([0-9a-f-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const mealId = ctx.match?.[1];
    if (mealId) {
      await handleChangeMealType(ctx, mealId);
    }
  });

  bot.callbackQuery(/^set_type_(\w+)_([0-9a-f-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const mealType = ctx.match?.[1];
    const mealId = ctx.match?.[2];
    if (mealType && mealId) {
      await handleSetMealType(ctx, db, mealType, mealId);
    }
  });

  bot.callbackQuery(/^delete_meal_([0-9a-f-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const mealId = ctx.match?.[1];
    if (mealId) {
      await handleDeleteMeal(ctx, mealId);
    }
  });

  bot.callbackQuery(/^confirm_delete_meal_([0-9a-f-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const mealId = ctx.match?.[1];
    if (mealId) {
      await handleConfirmDeleteMeal(ctx, db, mealId);
    }
  });

  bot.callbackQuery(/^edit_description_([0-9a-f-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const mealId = ctx.match?.[1];
    if (mealId) {
      await handleEditMealDescription(ctx, db, mealId);
    }
  });

  bot.callbackQuery(/^back_to_edit_meal_([0-9a-f-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const mealId = ctx.match?.[1];
    if (mealId) {
      await handleEditMeal(ctx, db, mealId);
    }
  });

  bot.callbackQuery('back_to_meals_list', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleBackToMealsList(ctx);
  });
};
