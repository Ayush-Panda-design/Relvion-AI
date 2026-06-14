import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  try {
    const accessToken = await (corsair as any).gmail.keys.get_access_token?.();
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await res.json();

    return NextResponse.json({
      email: profile?.emailAddress || '',
      messagesTotal: profile?.messagesTotal || 0,
      threadsTotal: profile?.threadsTotal || 0,
    });
  } catch (error: any) {
    console.error('[gmail/profile] failed:', error.message);
    return NextResponse.json({ email: '', messagesTotal: 0, threadsTotal: 0 });
  }
}
