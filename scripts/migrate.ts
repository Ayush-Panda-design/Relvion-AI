/**
 * Run database migrations from migration.sql
 * Usage: pnpm migrate  (requires DATABASE_URL in .env)
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getDbPool } from '../src/lib/db';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sqlPath = join(process.cwd(), 'migration.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  const db = getDbPool();

  console.log('Running migration.sql…');
  try {
    await db.query(sql);
    console.log('✅ Migration completed successfully');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Migration failed:', msg);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
