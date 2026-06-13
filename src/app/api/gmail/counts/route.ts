import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';

// Cache counts for 60s to avoid hammering Gmail on every sidebar render
let cachedCounts: Record<string, number> | null = null;
let cacheExpiry = 0;

export async function GET() {
  const now = Date.now();
  if (cachedCounts && now < cacheExpiry) {
    return NextResponse.json(cachedCounts);
  }

  try {
    const labelsRes = await (corsair as any).gmail.api.labels.list({ userId: 'me' });
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
        // messagesUnread for inbox / drafts; messagesTotal for others
        counts[key] =
          label.messagesUnread !== undefined
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
