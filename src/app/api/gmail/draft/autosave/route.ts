import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';
import { getSession } from '@/lib/auth/getSession';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ draft: null });

  try {
    const res = await db.query(
      `SELECT id, to_addr, cc, bcc, subject, body, gmail_draft_id, updated_at::text
       FROM compose_drafts WHERE tenant_id = $1`,
      [session.tenantId]
    );
    const row = res.rows[0];
    if (!row) return NextResponse.json({ draft: null });
    return NextResponse.json({
      draft: {
        id: row.id,
        to: row.to_addr || '',
        cc: row.cc || '',
        bcc: row.bcc || '',
        subject: row.subject || '',
        body: row.body || '',
        gmailDraftId: row.gmail_draft_id,
        updatedAt: row.updated_at,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ saved: false, reason: 'no_database' });
  }

  try {
    const { to, cc, bcc, subject, body, gmailDraftId } = await req.json();
    const id = randomUUID();

    await db.query(
      `INSERT INTO compose_drafts (id, tenant_id, to_addr, cc, bcc, subject, body, gmail_draft_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (tenant_id) DO UPDATE SET
         to_addr = EXCLUDED.to_addr,
         cc = EXCLUDED.cc,
         bcc = EXCLUDED.bcc,
         subject = EXCLUDED.subject,
         body = EXCLUDED.body,
         gmail_draft_id = COALESCE(EXCLUDED.gmail_draft_id, compose_drafts.gmail_draft_id),
         updated_at = NOW()`,
      [
        id,
        session.tenantId,
        to || '',
        cc || '',
        bcc || '',
        subject || '',
        body || '',
        gmailDraftId || null,
      ]
    );

    return NextResponse.json({ saved: true, at: new Date().toISOString() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Autosave failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ deleted: true });

  try {
    await db.query(`DELETE FROM compose_drafts WHERE tenant_id = $1`, [session.tenantId]);
    return NextResponse.json({ deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
