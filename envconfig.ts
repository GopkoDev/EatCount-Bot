import 'dotenv/config';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[ENV] Environment variable ${name} is required but not set.`
    );
  }
  return value;
};

export const config = {
  server: {
    nodeEnv: requireEnv('NODE_ENV'),
  },
  db: {
    url: requireEnv('DATABASE_URL'),
  },
  telegram: {
    botToken: requireEnv('TELEGRAM_BOT_TOKEN'),
  },
  openai: {
    apiKey: requireEnv('OPENAI_API_KEY'),
  },
};
