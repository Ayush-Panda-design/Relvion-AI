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
    const { to, subject, body, draftId } = await req.json();

    if (!subject && !body && !to) {
      return NextResponse.json({ error: 'Provide at least a subject, body, or recipient' }, { status: 400 });
    }

    const raw = encodeRawEmail({ to, subject, body });

    let result;
    if (draftId) {
      result = await corsair.gmail.api.drafts.update({
        id: draftId,
        draft: { message: { raw } },
      });
    } else {
      result = await corsair.gmail.api.drafts.create({
        draft: { message: { raw } },
      });
    }

    await logActivity('email_drafted', { draftId: result?.id || draftId, subject, to });

    return NextResponse.json({ success: true, draft: result });
  } catch (error: any) {
    console.error('[gmail/draft] error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to save draft' }, { status: 500 });
  }
}
