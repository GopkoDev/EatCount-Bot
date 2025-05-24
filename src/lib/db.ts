import { PrismaClient } from '@prisma/client';
import { config } from '../../envconfig.js';
import logger from '../lib/logger.js';
declare global {
  var prisma: PrismaClient | undefined;
}

export const initDb = () => {
  const db = globalThis.prisma || new PrismaClient();

  if (config.server.nodeEnv !== 'production') globalThis.prisma = db;

  db.$connect()
    .then(() => {
      logger.info('[Potgress]: successfully connected');
    })
    .catch((error) => {
      logger.error('[Potgress]: connection error:', error);
      process.exit(1);
    });

  return db;
};
