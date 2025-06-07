import type { MyContext } from '../../../../types.js';
import type { PrismaClient, MealType } from '@prisma/client';

import { getTodayRange } from '../../statistics-menu/helpers/get-time-ranges.js';
import { showMealsList } from '../../../../menus/edit-meals-menu.js';
import { showTodayMealTypes } from '../../../../menus/today-meal-types-menu.js';
import logger from '../../../../lib/logger.js';

export const showTodayMeals = async (ctx: MyContext, db: PrismaClient) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    logger.error('[EDIT MEALS] User ID not found in context');
    throw new Error('[EDIT MEALS] User ID not found');
  }

  const { startOfDay, endOfDay } = getTodayRange();

  const todaysMeals = await db.meal.findMany({
    where: {
      user: {
        telegramId: userId,
      },
      timestamp: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    select: {
      type: true,
    },
    distinct: ['type'],
    orderBy: {
      type: 'asc',
    },
  });

  const mealTypes = todaysMeals.map((meal) => meal.type);

  await showTodayMealTypes(ctx, mealTypes);
};

export const showTodayMealsByType = async (
  ctx: MyContext,
  db: PrismaClient,
  mealType: MealType
) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    logger.error('[EDIT MEALS] User ID not found in context');
    throw new Error('[EDIT MEALS] User ID not found');
  }

  const { startOfDay, endOfDay } = getTodayRange();

  const meals = await db.meal.findMany({
    where: {
      user: {
        telegramId: userId,
      },
      type: mealType,
      timestamp: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });

  ctx.session.editPage = 0;
  await showMealsList(ctx, meals, 0, true);
};

export const showRecentMeals = async (ctx: MyContext, db: PrismaClient) => {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    logger.error('[EDIT MEALS] User ID not found in context');
    throw new Error('[EDIT MEALS] User ID not found');
  }

  const meals = await db.meal.findMany({
    where: {
      user: {
        telegramId: userId,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 100,
  });

  const page = ctx.session.editPage || 0;
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(meals.length / ITEMS_PER_PAGE);
  const isLastPage = page >= totalPages - 1;

  await showMealsList(ctx, meals, page, isLastPage);
};

export const handlePagination = async (
  ctx: MyContext,
  db: PrismaClient,
  page: number
) => {
  ctx.session.editPage = page;
  await showRecentMeals(ctx, db);
};
