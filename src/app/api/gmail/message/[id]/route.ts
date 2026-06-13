import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';
import { extractBody } from '@/lib/gmail/extractBody';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing message id' }, { status: 400 });
  }

  try {
    const msg = await (corsair as any).gmail.api.messages.get({
      id,
      format: 'full',
    });

    if (!msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const headers: any[] = msg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const { text, html } = extractBody(msg.payload || {});

    return NextResponse.json({
      id: msg.id,
      threadId: msg.threadId,
      labelIds: msg.labelIds || [],
      snippet: msg.snippet || '',
      subject: getHeader('Subject') || '(no subject)',
      from: getHeader('From'),
      to: getHeader('To'),
      date: getHeader('Date'),
      body: { text, html },
    });
  } catch (error: any) {
    console.error('[gmail/message] fetch failed:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch message', detail: error.message },
      { status: 500 }
    );
  }
}
