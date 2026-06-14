import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// One-time migration endpoint — run once then delete this file.
// Hit: GET /api/migrate?secret=YOUR_MIGRATE_SECRET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];

  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`,
    `CREATE INDEX IF NOT EXISTS users_email_idx ON users (email)`,
    `CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON users (tenant_id)`,
  ];

  for (const sql of migrations) {
    try {
      await db.query(sql);
      results.push(`✅ ${sql}`);
    } catch (err: any) {
      results.push(`❌ ${sql} — ${err.message}`);
    }
  }

  return NextResponse.json({ done: true, results });
}