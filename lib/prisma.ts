/**
 * Prisma Client Singleton
 * Menghindari multiple instance di development (hot reload Next.js)
 * Ref: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const poolConnectionString = (() => {
  // pg Pool doesn't understand Prisma's `?schema=` query param.
  // Strip it to avoid connection errors like "unrecognized configuration parameter \"schema\"".
  try {
    const url = new URL(databaseUrl);
    url.searchParams.delete('schema');
    return url.toString();
  } catch {
    return databaseUrl;
  }
})();

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: poolConnectionString,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
