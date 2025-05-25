import { Bot } from 'grammy';
import type { PrismaClient } from '@prisma/client';
import type { MyContext } from '../../../types.js';
import { showMainMenu } from '../../../menus/main-menu.js';

export const startCommand = (bot: Bot<MyContext>, db: PrismaClient) => {
  bot.command('start', async (ctx) => {
    if (!ctx.from || !ctx.chat || ctx.chat.type !== 'private') return;
    const from = ctx.from;

    const user = await db.user.findUnique({
      where: {
        telegramId: from.id.toString(),
      },
    });

    if (!user) {
      await db.user.create({
        data: {
          telegramId: from.id.toString(),
          telegramUsername: from.username,
          languageCode: from.language_code,
          name: from.first_name + ' ' + from.last_name || '',
        },
      });
    }

    await ctx.reply(
      `Вітаю ${from.first_name}! Що ж, почнемо працювати з EatCount Bot!`
    );

    await showMainMenu(ctx);
  });
};
