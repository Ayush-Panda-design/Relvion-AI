import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import {
  fetchMessagesByIds,
  buildDbMessageIndex,
  listCacheKey,
  INBOX_MAX_RESULTS,
  FOLDER_MAX_RESULTS,
  shouldCacheList,
} from '@/lib/gmail/listFetch';
import { getTenantCache, setTenantCache } from '@/lib/tenant-cache';
import {
  getActiveSnoozedIds,
  listSnoozedForTenant,
} from '@/server/services/snooze';

const LIST_CACHE_TTL_MS = 90_000;

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder') || 'inbox';
  const cacheKey = listCacheKey(folder);

  const cached = getTenantCache<{ emails: unknown[] }>(session.tenantId, cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const corsair = corsairForTenant(session.tenantId);

  try {
    if (folder === 'snoozed') {
      const snoozed = await listSnoozedForTenant(session.tenantId);
      if (snoozed.length === 0) {
        return NextResponse.json({ emails: [] });
      }

      const emails = await fetchMessagesByIds(
        corsair,
        snoozed.map((s) => s.email_id)
      );

      const withSnooze = emails.map((item) => ({
        ...item,
        snoozeUntil: snoozed.find((s) => s.email_id === item.id)?.snooze_until,
      }));

      const payload = { emails: withSnooze };
      if (shouldCacheList(withSnooze)) {
        setTenantCache(session.tenantId, cacheKey, payload, LIST_CACHE_TTL_MS);
      }
      return NextResponse.json(payload);
    }

    const FOLDER_LABELS: Record<string, string> = {
      inbox: 'INBOX',
      sent: 'SENT',
      drafts: 'DRAFT',
      spam: 'SPAM',
      trash: 'TRASH',
    };

    const label = FOLDER_LABELS[folder] || 'INBOX';

    const maxResults = folder === 'inbox' ? INBOX_MAX_RESULTS : FOLDER_MAX_RESULTS;

    const [listRes, snoozedIds] = await Promise.all([
      corsair.gmail.api.messages.list({
        labelIds: [label],
        maxResults,
      }),
      folder === 'inbox' ? getActiveSnoozedIds(session.tenantId) : Promise.resolve(new Set<string>()),
    ]);

    const messageIds: string[] = (listRes?.messages || [])
      .map((m: { id?: string }) => m.id)
      .filter((id: string | undefined): id is string => Boolean(id));

    if (messageIds.length === 0) {
      return NextResponse.json({ emails: [] });
    }

    const dbIndex = await buildDbMessageIndex(corsair);
    const fetched = await fetchMessagesByIds(corsair, messageIds, dbIndex);
    const emails = fetched.filter((item) => !snoozedIds.has(item.id));

    const payload = { emails };
    if (shouldCacheList(emails)) {
      setTenantCache(session.tenantId, cacheKey, payload, LIST_CACHE_TTL_MS);
    }
    return NextResponse.json(payload);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to fetch emails';
    console.error('[gmail/list] API fetch failed:', message);
    return NextResponse.json({ emails: [], error: message }, { status: 200 });
  }
}
