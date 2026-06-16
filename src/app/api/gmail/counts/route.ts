import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

// Cache counts for 60s to avoid hammering Gmail on every sidebar render
let cachedCounts: Record<string, number> | null = null;
let cacheExpiry = 0;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  const now = Date.now();
  if (cachedCounts && now < cacheExpiry) {
    return NextResponse.json(cachedCounts);
  }

  try {
    const labelsRes = await corsair.gmail.api.labels.list({ userId: 'me' });
    const labels: any[] = labelsRes?.labels || [];

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
    };

    for (const label of labels) {
      const key = wantedIds[label.id];
      if (key) {
        counts[key] =
          key === 'inbox'
            ? label.messagesTotal || label.messagesUnread || 0
            : label.messagesUnread !== undefined
              ? label.messagesUnread
              : label.messagesTotal || 0;
      }
    }

    cachedCounts = counts;
    cacheExpiry = now + 60_000;
    return NextResponse.json(counts);
  } catch (error: any) {
    console.error('[gmail/counts] failed:', error.message);
    // Return zeros rather than 500 — sidebar degrades gracefully
    return NextResponse.json({
      inbox: 0,
      drafts: 0,
      sent: 0,
      trash: 0,
      spam: 0,
      starred: 0,
    });
  }
}
