import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';

export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing to, subject, or body' }, { status: 400 });
    }

    // Build RFC 2822 email message
    const messageParts = [
      'From: me',
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      body,
    ];
    const messageStr = messageParts.join('\r\n');

    // Base64url encode it (required by Gmail API)
    const encodedEmail = Buffer.from(messageStr)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send using Corsair's Gmail API plugin
    const result = await corsair.gmail.api.messages.send({
      raw: encodedEmail,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
