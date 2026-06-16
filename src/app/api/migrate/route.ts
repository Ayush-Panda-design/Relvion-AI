import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/migrate?secret=YOUR_MIGRATE_SECRET
 * Runs migration.sql — prefer `pnpm migrate` for local dev.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  try {
    const sql = readFileSync(join(process.cwd(), 'migration.sql'), 'utf8');
    await db.query(sql);
    return NextResponse.json({ done: true, message: 'migration.sql applied' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'migration failed';
    console.error('[api/migrate]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
