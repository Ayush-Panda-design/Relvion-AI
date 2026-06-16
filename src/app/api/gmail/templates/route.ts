import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { getSession } from '@/lib/auth/getSession';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ templates: [] });

  try {
    const res = await db.query(
      `SELECT id, name, subject, body, created_at::text
       FROM email_templates
       WHERE tenant_id = $1 OR tenant_id IS NULL
       ORDER BY name ASC`,
      [session.tenantId]
    );
    return NextResponse.json({ templates: res.rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list templates';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const { name, subject, body } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = randomUUID();
    await db.query(
      `INSERT INTO email_templates (id, tenant_id, name, subject, body)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, session.tenantId, name.trim(), subject || '', body || '']
    );

    return NextResponse.json({ template: { id, name, subject, body } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create template';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
