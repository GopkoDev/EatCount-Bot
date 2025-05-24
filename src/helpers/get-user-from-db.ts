import type { PrismaClient } from '@prisma/client';
import logger from '../lib/logger.js';

export const getUserFromDb = async (userId: string, db: PrismaClient) => {
  const user = await db.user.findUnique({
    where: {
      telegramId: userId,
    },
  });

  if (!user) {
    logger.error('User not found');
    throw new Error('User not found');
  }

  return user;
};
