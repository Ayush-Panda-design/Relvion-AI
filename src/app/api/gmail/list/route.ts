import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { parseGmailMessage, toEmailListItem } from '@/lib/gmail/parseMessage';
import {
  getActiveSnoozedIds,
  listSnoozedForTenant,
} from '@/server/services/snooze';

function messageToListItem(msg: unknown) {
  const parsed = parseGmailMessage(msg);
  if (parsed) return toEmailListItem(parsed);

  return null;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'inbox';

    if (folder === 'snoozed') {
      const snoozed = await listSnoozedForTenant(session.tenantId);
      if (snoozed.length === 0) {
        return NextResponse.json({ emails: [] });
      }

      const emails = [];
      const results = await Promise.allSettled(
        snoozed.map((s) =>
          corsair.gmail.api.messages.get({ id: s.email_id, format: 'full' })
        )
      );

      for (const result of results) {
        if (result.status !== 'fulfilled' || !result.value) continue;
        const item = messageToListItem(result.value);
        if (item) {
          emails.push({
            ...item,
            snoozeUntil: snoozed.find((s) => s.email_id === item.id)?.snooze_until,
          });
        }
      }

      return NextResponse.json({ emails });
    }

    const FOLDER_LABELS: Record<string, string> = {
      inbox: 'INBOX',
      sent: 'SENT',
      drafts: 'DRAFT',
      spam: 'SPAM',
      trash: 'TRASH',
    };

    const label = FOLDER_LABELS[folder] || 'INBOX';

    const listRes = await corsair.gmail.api.messages.list({
      labelIds: [label],
      maxResults: 20,
    });

    const messageIds: string[] = (listRes?.messages || [])
      .map((m: { id?: string }) => m.id)
      .filter((id: string | undefined): id is string => Boolean(id));

    if (messageIds.length === 0) {
      return NextResponse.json({ emails: [] });
    }

    const snoozedIds =
      folder === 'inbox' ? await getActiveSnoozedIds(session.tenantId) : new Set<string>();

    const results = await Promise.allSettled(
      messageIds.map((id) =>
        corsair.gmail.api.messages.get({
          id,
          format: 'full',
        })
      )
    );

    const emails = [];
    for (const result of results) {
      if (result.status !== 'fulfilled' || !result.value) continue;
      const item = messageToListItem(result.value);
      if (!item) continue;
      if (snoozedIds.has(item.id)) continue;
      emails.push(item);
    }

    return NextResponse.json({ emails });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to fetch emails';
    console.error('[gmail/list] API fetch failed:', message);
    return NextResponse.json({ emails: [], error: message }, { status: 200 });
  }
}
