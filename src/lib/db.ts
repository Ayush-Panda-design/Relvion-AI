import { Pool, type PoolConfig } from 'pg';

function buildPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return {};
  }

  const isLocal =
    connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const hasSslMode = /[?&]sslmode=/i.test(connectionString);

  return {
    connectionString,
    ...(isLocal || hasSslMode ? {} : { ssl: { rejectUnauthorized: false } }),
  };
}

const globalForPg = globalThis as { relvionPgPool?: Pool };

/** Shared Postgres pool — enables SSL for remote hosts (e.g. Render from Vercel). */
export function getDbPool(): Pool {
  if (!globalForPg.relvionPgPool) {
    globalForPg.relvionPgPool = new Pool(buildPoolConfig());
  }
  return globalForPg.relvionPgPool;
}

export const db = getDbPool();
