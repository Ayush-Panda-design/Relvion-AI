import { NextResponse } from 'next/server';
import { listDueSnoozes, clearSnooze } from '@/server/services/snooze';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const due = await listDueSnoozes();
  const released: string[] = [];
  const errors: { emailId: string; error: string }[] = [];

  for (const row of due) {
    if (!row.tenant_id) continue;
    try {
      const corsair = corsairForTenant(row.tenant_id);
      await corsair.gmail.api.messages.modify({
        id: row.email_id,
        addLabelIds: ['INBOX'],
      });
      await clearSnooze(row.tenant_id, row.email_id);
      released.push(row.email_id);
    } catch (err: unknown) {
      errors.push({
        emailId: row.email_id,
        error: err instanceof Error ? err.message : 'release failed',
      });
    }
  }

  return NextResponse.json({ released: released.length, ids: released, errors });
}
