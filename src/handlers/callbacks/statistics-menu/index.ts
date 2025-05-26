import { Bot } from 'grammy';
import type { MyContext } from '../../../types.js';
import type { PrismaClient } from '@prisma/client/extension';
import { statsTodayService } from './services/stats-today.js';
import { statsWeekService } from './services/stats-week.js';
import { showMainMenu } from '../../../menus/main-menu.js';

export const statisticsMenuCallbacks = (
  bot: Bot<MyContext>,
  db: PrismaClient
) => {
  bot.callbackQuery('stats_tooday', async (ctx) => {
    await ctx.answerCallbackQuery();
    await statsTodayService(ctx, db);
    await showMainMenu(ctx);
  });

  bot.callbackQuery('stats_this_week', async (ctx) => {
    await ctx.answerCallbackQuery();
    await statsWeekService(ctx, db, 'stats_this_week');
    await showMainMenu(ctx);
  });

  bot.callbackQuery('stats_last_week', async (ctx) => {
    await ctx.answerCallbackQuery();
    await statsWeekService(ctx, db, 'stats_last_week');
    await showMainMenu(ctx);
  });
};
