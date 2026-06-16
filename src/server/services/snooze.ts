import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export type SnoozeRow = {
  id: string;
  tenant_id?: string;
  email_id: string;
  thread_id: string | null;
  snooze_until: string;
};

export async function snoozeEmail(
  tenantId: string,
  emailId: string,
  threadId: string | undefined,
  snoozeUntil: Date
): Promise<SnoozeRow> {
  const id = randomUUID();
  await db.query(
    `INSERT INTO snoozed_emails (id, tenant_id, email_id, thread_id, snooze_until)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tenant_id, email_id) DO UPDATE SET
       snooze_until = EXCLUDED.snooze_until,
       thread_id = EXCLUDED.thread_id`,
    [id, tenantId, emailId, threadId || null, snoozeUntil.toISOString()]
  );
  const res = await db.query<SnoozeRow>(
    `SELECT id, email_id, thread_id, snooze_until::text
     FROM snoozed_emails WHERE tenant_id = $1 AND email_id = $2`,
    [tenantId, emailId]
  );
  return res.rows[0];
}

export async function getActiveSnoozedIds(tenantId: string): Promise<Set<string>> {
  if (!process.env.DATABASE_URL) return new Set();
  try {
    const res = await db.query<{ email_id: string }>(
      `SELECT email_id FROM snoozed_emails
       WHERE tenant_id = $1 AND snooze_until > NOW()`,
      [tenantId]
    );
    return new Set(res.rows.map((r) => r.email_id));
  } catch (err) {
    console.warn('[snooze] getActiveSnoozedIds failed (inbox will show all mail):', err);
    return new Set();
  }
}

export async function listDueSnoozes(tenantId?: string): Promise<SnoozeRow[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const res = tenantId
      ? await db.query<SnoozeRow>(
          `SELECT id, tenant_id, email_id, thread_id, snooze_until::text
           FROM snoozed_emails WHERE tenant_id = $1 AND snooze_until <= NOW()`,
          [tenantId]
        )
      : await db.query<SnoozeRow>(
          `SELECT id, tenant_id, email_id, thread_id, snooze_until::text
           FROM snoozed_emails WHERE snooze_until <= NOW()`
        );
    return res.rows;
  } catch (err) {
    console.warn('[snooze] listDueSnoozes failed:', err);
    return [];
  }
}

export async function listSnoozedForTenant(tenantId: string): Promise<SnoozeRow[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const res = await db.query<SnoozeRow>(
      `SELECT id, email_id, thread_id, snooze_until::text
       FROM snoozed_emails
       WHERE tenant_id = $1 AND snooze_until > NOW()
       ORDER BY snooze_until ASC`,
      [tenantId]
    );
    return res.rows;
  } catch (err) {
    console.warn('[snooze] listSnoozedForTenant failed:', err);
    return [];
  }
}

export async function clearSnooze(tenantId: string, emailId: string): Promise<void> {
  await db.query(`DELETE FROM snoozed_emails WHERE tenant_id = $1 AND email_id = $2`, [
    tenantId,
    emailId,
  ]);
}

export async function countSnoozedForTenant(tenantId: string): Promise<number> {
  if (!process.env.DATABASE_URL) return 0;
  try {
    const res = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM snoozed_emails
       WHERE tenant_id = $1 AND snooze_until > NOW()`,
      [tenantId]
    );
    return parseInt(res.rows[0]?.count || '0', 10);
  } catch {
    return 0;
  }
}
