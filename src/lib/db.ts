import { PrismaClient } from '@prisma/client';
import { sql } from '@vercel/postgres';

// Para Vercel Postgres
export { sql };

// Para Prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
