import { startTelegramBot } from './src/index.js';
import { config } from './envconfig.js';

await startTelegramBot(config.telegram.botToken);
