import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@/lib/auth/getSession';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const { name, subject, body } = await req.json();
    const res = await db.query(
      `UPDATE email_templates SET
         name = COALESCE($3, name),
         subject = COALESCE($4, subject),
         body = COALESCE($5, body)
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, name, subject, body`,
      [id, session.tenantId, name, subject, body]
    );
    if (!res.rows[0]) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ template: res.rows[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const res = await db.query(
      `DELETE FROM email_templates WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [id, session.tenantId]
    );
    if (!res.rows[0]) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
