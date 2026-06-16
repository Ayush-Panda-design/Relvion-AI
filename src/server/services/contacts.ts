import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

export type ContactRow = {
  email: string;
  name: string | null;
  email_count: number;
  last_emailed_at: string;
};

/** Upsert contact on send/receive. */
export async function trackContact(
  tenantId: string,
  email: string,
  name?: string
): Promise<void> {
  if (!email || !process.env.DATABASE_URL) return;
  const normalized = email.toLowerCase().trim();
  if (!normalized.includes('@')) return;

  try {
    await db.query(
      `INSERT INTO contacts (id, tenant_id, email, name, email_count, last_emailed_at)
       VALUES ($1, $2, $3, $4, 1, NOW())
       ON CONFLICT (tenant_id, email) DO UPDATE SET
         email_count = contacts.email_count + 1,
         last_emailed_at = NOW(),
         name = COALESCE(EXCLUDED.name, contacts.name)`,
      [randomUUID(), tenantId, normalized, name || null]
    );
  } catch (err) {
    console.error('[contacts] track failed:', err);
  }
}

export async function getContactStats(
  tenantId: string,
  senderEmail: string
): Promise<ContactRow | null> {
  if (!senderEmail || !process.env.DATABASE_URL) return null;
  try {
    const res = await db.query<ContactRow>(
      `SELECT email, name, email_count, last_emailed_at::text
       FROM contacts WHERE tenant_id = $1 AND email = $2`,
      [tenantId, senderEmail.toLowerCase().trim()]
    );
    return res.rows[0] || null;
  } catch {
    return null;
  }
}

/** Boost triage: frequent contacts get +1 priority tier. */
export function applyContactBoost(
  priority: 'URGENT' | 'IMPORTANT' | 'FYI',
  emailCount: number
): 'URGENT' | 'IMPORTANT' | 'FYI' {
  if (emailCount >= 20) {
    if (priority === 'FYI') return 'IMPORTANT';
    if (priority === 'IMPORTANT') return 'URGENT';
  } else if (emailCount >= 8) {
    if (priority === 'FYI') return 'IMPORTANT';
  }
  return priority;
}
