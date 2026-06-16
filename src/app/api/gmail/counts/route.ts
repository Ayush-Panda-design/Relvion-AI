import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { getTenantCache, setTenantCache } from '@/lib/tenant-cache';

const CACHE_KEY = 'gmail-label-counts';
const CACHE_TTL_MS = 60_000;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tenantId } = session;
  const cached = getTenantCache<Record<string, number>>(tenantId, CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached);
  }

  const corsair = corsairForTenant(tenantId);

  try {
    const labelsRes = await corsair.gmail.api.labels.list({ userId: 'me' });
    const labels: { id?: string; messagesTotal?: number; messagesUnread?: number }[] =
      labelsRes?.labels || [];

    const wantedIds: Record<string, string> = {
      INBOX: 'inbox',
      DRAFT: 'drafts',
      SENT: 'sent',
      TRASH: 'trash',
      SPAM: 'spam',
      STARRED: 'starred',
    };

    const counts: Record<string, number> = {
      inbox: 0,
      drafts: 0,
      sent: 0,
      trash: 0,
      spam: 0,
      starred: 0,
      snoozed: 0,
    };

    for (const label of labels) {
      const key = label.id ? wantedIds[label.id] : undefined;
      if (key) {
        counts[key] =
          key === 'inbox'
            ? label.messagesTotal || label.messagesUnread || 0
            : label.messagesUnread !== undefined
              ? label.messagesUnread
              : label.messagesTotal || 0;
      }
    }

    try {
      const { countSnoozedForTenant } = await import('@/server/services/snooze');
      counts.snoozed = await countSnoozedForTenant(tenantId);
    } catch {
      counts.snoozed = 0;
    }

    setTenantCache(tenantId, CACHE_KEY, counts, CACHE_TTL_MS);
    return NextResponse.json(counts);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'counts failed';
    console.error('[gmail/counts] failed:', msg);
    return NextResponse.json({
      inbox: 0,
      drafts: 0,
      sent: 0,
      trash: 0,
      spam: 0,
      starred: 0,
      snoozed: 0,
    });
  }
}
