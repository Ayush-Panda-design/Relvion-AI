import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { encodeRawEmail } from '@/lib/gmail/encodeMessage';
import { logActivity } from '@/lib/activityLog';
import { trackContact } from '@/server/services/contacts';
import { parseEmailAddress } from '@/lib/gmail/parseMessage';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { threadId, messageId, to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
    const encodedEmail = encodeRawEmail({
      to,
      subject: replySubject,
      body,
      inReplyTo: threadId,
      references: threadId,
    });

    const result = await corsair.gmail.api.messages.send({
      raw: encodedEmail,
      ...(threadId ? { threadId } : {}),
    });

    await logActivity('email_replied', {
      messageId: result?.id,
      threadId: threadId || result?.threadId,
      to,
      subject: replySubject,
    });

    const recipient = parseEmailAddress(to) || to;
    if (recipient.includes('@')) void trackContact(session.tenantId, recipient);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Reply error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
