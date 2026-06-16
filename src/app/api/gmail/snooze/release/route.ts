import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { listDueSnoozes, clearSnooze } from '@/server/services/snooze';

/** Release due snoozes for the current tenant (client poll while app is open). */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const due = await listDueSnoozes(session.tenantId);
  const released: string[] = [];

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
    } catch {
      /* skip */
    }
  }

  return NextResponse.json({ released: released.length });
}
