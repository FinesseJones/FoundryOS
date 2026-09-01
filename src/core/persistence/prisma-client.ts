import { PrismaClient } from '@prisma/client';

let globalPrisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return globalPrisma;
}

export const prisma = getPrismaClient();
