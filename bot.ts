import { startTelegramBot } from './src/index.js';
import { config } from './envconfig.js';
import { initOpenaiClient } from './src/lib/openai-client.js';

initOpenaiClient(config.openai.apiKey);

await startTelegramBot(config.telegram.botToken);
