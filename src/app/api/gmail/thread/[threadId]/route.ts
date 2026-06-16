import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { fetchMessagesByIds } from '@/lib/gmail/listFetch';

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
      format: 'minimal',
    });

    const messageIds: string[] = (thread?.messages || [])
      .map((m: { id?: string }) => m.id)
      .filter((id: string | undefined): id is string => Boolean(id));

    if (messageIds.length === 0) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const listItems = await fetchMessagesByIds(corsair, messageIds);
    const byId = new Map(listItems.map((item) => [item.id, item]));

    const messages = messageIds
      .map((id) => byId.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        id: item.id,
        threadId: item.threadId,
        subject: item.data?.subject || '(no subject)',
        from: item.data?.from || 'Unknown Sender',
        fromEmail: item.data?.fromEmail || '',
        to: item.data?.to || '',
        date: item.data?.date || new Date().toISOString(),
        snippet: item.data?.body || '',
        body: { text: item.data?.body || '', html: '' },
        isUnread: item.data?.unread ?? false,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      threadId,
      messageCount: messages.length,
      messages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch thread';
    console.error('[gmail/thread] fetch failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
