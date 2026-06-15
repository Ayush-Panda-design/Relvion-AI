import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

// Folder → Gmail label mapping
const FOLDER_LABELS: Record<string, string> = {
  inbox: 'INBOX',
  sent: 'SENT',
  drafts: 'DRAFT',
  spam: 'SPAM',
  trash: 'TRASH',
  snoozed: 'SNOOZED',
};

/** Returns the display name portion, or falls back to the email address */
function parseDisplayName(from: string): string {
  if (!from) return 'Unknown Sender';
  // e.g. "John Doe <john@example.com>" → "John Doe"
  const match = from.match(/^([^<]+)</);
  if (match && match[1].trim()) return match[1].trim();
  // Just an email address — strip angle brackets
  return from.replace(/[<>]/g, '').trim();
}

/** Extracts the raw email address from a From header value */
function parseEmailAddress(from: string): string {
  if (!from) return '';
  // e.g. "John Doe <john@example.com>" → "john@example.com"
  const match = from.match(/<([^>]+)>/);
  if (match) return match[1].trim();
  // Plain email with no angle brackets
  return from.replace(/[<>]/g, '').trim();
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'inbox';

    // Use the Gmail API to list messages in the folder
    const label = FOLDER_LABELS[folder] || 'INBOX';

    // Fetch message list from Gmail API via Corsair
    const listRes = await corsair.gmail.api.messages.list({
      labelIds: [label],
      maxResults: 20,
    });

    const messageIds: string[] = (listRes?.messages || []).map((m: any) => m.id);

    if (messageIds.length === 0) {
      return NextResponse.json({ emails: [] });
    }

    // Fetch full message details in parallel (all at once)
    const emails = [];
    const results = await Promise.all(
      messageIds.map((id: string) =>
        corsair.gmail.api.messages.get({ 
          id, 
          format: 'full'
        })
      )
    );
    
    for (const msg of results) {
      if (!msg) continue;
      const headers: any[] = msg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      const rawFrom = getHeader('From');
      emails.push({
        id: msg.id,
        threadId: msg.threadId,
        labelIds: msg.labelIds || [],
        data: {
          subject: getHeader('Subject') || '(no subject)',
          from: parseDisplayName(rawFrom),
          fromEmail: parseEmailAddress(rawFrom),
          to: getHeader('To'),
          date: getHeader('Date') || new Date().toISOString(),
          body: msg.snippet || '',
        },
      });
    }

    return NextResponse.json({ emails });
  } catch (e: any) {
    console.error('[gmail/list] API fetch failed:', e.message);
    return NextResponse.json({ emails: [], error: e.message || 'Failed to fetch emails' }, { status: 200 });
  }
}
