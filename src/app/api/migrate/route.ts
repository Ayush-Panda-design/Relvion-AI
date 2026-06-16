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
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      email_count INT NOT NULL DEFAULT 1,
      last_emailed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, email)
    )`,
    `CREATE TABLE IF NOT EXISTS compose_drafts (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL UNIQUE,
      to_addr TEXT,
      cc TEXT,
      bcc TEXT,
      subject TEXT,
      body TEXT,
      gmail_draft_id TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS snoozed_emails (
      id TEXT PRIMARY KEY,
      email_id TEXT NOT NULL,
      snooze_until TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `ALTER TABLE snoozed_emails ADD COLUMN IF NOT EXISTS tenant_id TEXT`,
    `ALTER TABLE snoozed_emails ADD COLUMN IF NOT EXISTS thread_id TEXT`,
    `CREATE UNIQUE INDEX IF NOT EXISTS snoozed_emails_tenant_email_idx ON snoozed_emails (tenant_id, email_id)`,
    `ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS tenant_id TEXT`,
    `CREATE INDEX IF NOT EXISTS email_templates_tenant_idx ON email_templates (tenant_id)`,
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