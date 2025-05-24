import { startTelegramBot } from './src/index.js';
import { config } from './envconfig.js';
import { initOpenaiClient } from './src/lib/openai-client.js';
import { initFatSecretClient } from './src/lib/fatsecret-client.js';

initOpenaiClient(config.openai.apiKey);

await initFatSecretClient(
  config.fatSecret.clientId,
  config.fatSecret.clientSecret
);

await startTelegramBot(config.telegram.botToken);
