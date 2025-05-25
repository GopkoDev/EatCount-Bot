import { Bot } from 'grammy';
import type { MyContext } from './types.js';

import logger, { botRequestLogger, botErrorLogger } from './lib/logger.js';
import { initDb } from './lib/db.js';

import { registerMiddlewares } from './middlewares/index.js';
import { registerCommands } from './handlers/comands/index.js';
import { registerMassages } from './handlers/massages/index.js';
import { registerKeyboardsCallbacks } from './handlers/callbacks/index.js';

export const startTelegramBot = async (token: string) => {
  const bot = new Bot<MyContext>(token);
  const db = initDb();

  botRequestLogger(bot);

  registerMiddlewares(bot);
  registerCommands(bot, db);
  registerMassages(bot, db);
  registerKeyboardsCallbacks(bot);

  bot.catch((err) => {
    botErrorLogger(err);
  });

  try {
    bot.start({
      onStart: (botInfo) => {
        logger.info(`[Bot]: is running as ${botInfo.username}`);
      },
      allowed_updates: ['message', 'callback_query'],
    });
  } catch (error) {
    logger.error('[Bot]: Failed to start', { error });
  }
};
