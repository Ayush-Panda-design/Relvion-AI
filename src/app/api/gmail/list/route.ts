import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';
import { mockEmails } from '@/lib/mockData';

// Folder → Gmail label mapping
const FOLDER_LABELS: Record<string, string> = {
  inbox: 'INBOX',
  sent: 'SENT',
  drafts: 'DRAFT',
  spam: 'SPAM',
  trash: 'TRASH',
  snoozed: 'SNOOZED',
};

function parseFrom(from: string): string {
  if (!from) return 'Unknown Sender';
  // e.g. "John Doe <john@example.com>" → "John Doe"
  const match = from.match(/^([^<]+)</);
  if (match && match[1].trim()) return match[1].trim();
  // Fallback: if it's just an email like <friend@corsair.dev>, strip brackets
  return from.replace(/[<>]/g, '').trim();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder') || 'inbox';

  try {
    // Use the Gmail API to list messages in the folder
    const label = FOLDER_LABELS[folder] || 'INBOX';

    // Fetch message list from Gmail API via Corsair
    const listRes = await (corsair as any).gmail.api.messages.list({
      labelIds: [label],
      maxResults: 20,
    });

    const messageIds: string[] = (listRes?.messages || []).map((m: any) => m.id);

    if (messageIds.length === 0) {
      // No real emails → fall back to mock data
      throw new Error('No messages from API');
    }

    // Fetch full message details in parallel (batched to 5)
    const emails = [];
    for (let i = 0; i < messageIds.length; i += 5) {
      const batch = messageIds.slice(i, i + 5);
      const results = await Promise.all(
        batch.map((id: string) =>
          (corsair as any).gmail.api.messages.get({ id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date', 'To'] })
        )
      );
      for (const msg of results) {
        if (!msg) continue;
        const headers: any[] = msg.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

        emails.push({
          id: msg.id,
          threadId: msg.threadId,
          labelIds: msg.labelIds || [],
          data: {
            subject: getHeader('Subject') || '(no subject)',
            from: parseFrom(getHeader('From')),
            to: getHeader('To'),
            date: getHeader('Date') || new Date().toISOString(),
            body: msg.snippet || '',
          },
        });
      }
    }

    return NextResponse.json({ emails });
  } catch (e: any) {
    console.error('[gmail/list] API fetch failed, using mock data:', e.message);
  }

  // Fall back to mock data filtered by folder
  const label = FOLDER_LABELS[folder];
  const filtered = mockEmails.filter(e => label ? e.labelIds.includes(label) : true);
  return NextResponse.json({ emails: filtered.length ? filtered : mockEmails });
}
