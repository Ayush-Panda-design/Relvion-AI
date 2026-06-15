import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { encodeRawEmail, Attachment } from '@/lib/gmail/encodeMessage';
import { logActivity } from '@/lib/activityLog';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const formData = await req.formData();

    const to = formData.get('to') as string | null;
    const subject = formData.get('subject') as string | null;
    const body = formData.get('body') as string | null;

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing to, subject, or body' }, { status: 400 });
    }

    // Process file attachments
    const attachmentFiles = formData.getAll('attachments') as File[];
    const attachments: Attachment[] = [];

    for (const file of attachmentFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: buffer.toString('base64'),
        size: file.size,
      });
    }

    const encodedEmail = encodeRawEmail({ to, subject, body, attachments });

    const result = await corsair.gmail.api.messages.send({
      raw: encodedEmail,
    });

    await logActivity('email_sent', {
      messageId: result?.id,
      threadId: result?.threadId,
      to,
      subject,
      attachmentCount: attachments.length,
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
