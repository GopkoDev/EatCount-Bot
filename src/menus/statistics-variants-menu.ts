import { InlineKeyboard } from 'grammy';
import type { MyContext } from '../types.js';

export const showStatisticsMenu = async (ctx: MyContext) => {
  const keyboard = new InlineKeyboard()
    .text('📅 Сьогодні', 'stats_tooday')
    .row()
    .text('📆 Цього тижня', 'stats_this_week')
    .row()
    .text('📆 Минулого тижня', 'stats_last_week');

  await ctx.reply('Оберіть період для статистики:', { reply_markup: keyboard });
};
