import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { encodeRawEmail } from '@/lib/gmail/encodeMessage';
import { logActivity } from '@/lib/activityLog';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const { to, subject, body } = await req.json();

    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const corsair = corsairForTenant(session.tenantId);

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing to, subject, or body' }, { status: 400 });
    }

    const encodedEmail = encodeRawEmail({ to, subject, body });

    const result = await corsair.gmail.api.messages.send({
      raw: encodedEmail,
    });

    await logActivity('email_sent', {
      messageId: result?.id,
      threadId: result?.threadId,
      to,
      subject,
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
