import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { parseGmailMessage, type ParsedMessage } from '@/lib/gmail/parseMessage';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  if (!threadId) {
    return NextResponse.json({ error: 'Missing thread id' }, { status: 400 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const thread = await corsair.gmail.api.threads.get({
      id: threadId,
      format: 'full',
    });

    if (!thread?.messages?.length) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const messages = (thread.messages as unknown[])
      .map((msg) => parseGmailMessage(msg))
      .filter((m): m is ParsedMessage => Boolean(m))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      threadId,
      messageCount: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        threadId: m.threadId,
        subject: m.subject,
        from: m.from,
        fromEmail: m.fromEmail,
        to: m.to,
        date: m.date,
        snippet: m.snippet,
        body: { text: m.bodyText || '', html: m.bodyHtml || '' },
        isUnread: m.isUnread,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch thread';
    console.error('[gmail/thread] fetch failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
