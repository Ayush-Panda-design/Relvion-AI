import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';

export async function POST(req: Request) {
  try {
    const { to, subject, body, threadId } = await req.json();
    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const messageParts = [
      'From: me',
      `To: ${to}`,
      `Subject: ${subject.startsWith('Re:') ? subject : 'Re: ' + subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      ...(threadId ? [`In-Reply-To: ${threadId}`, `References: ${threadId}`] : []),
      '',
      body,
    ];

    const encodedEmail = Buffer.from(messageParts.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await (corsair as any).gmail.api.messages.send({
      raw: encodedEmail,
      ...(threadId ? { threadId } : {}),
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Reply error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
