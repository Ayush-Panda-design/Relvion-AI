import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { ensureCorsairSetup } from '@/server/ensureCorsairSetup';
import { syncGoogleOAuthCredentialsFromEnv } from '@/server/googleOAuth';
import { formatGmailConnectError } from '@/lib/gmail-connect-error';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized', needsGoogle: true }, { status: 401 });
  }

  try {
    await ensureCorsairSetup(session.tenantId);
    await syncGoogleOAuthCredentialsFromEnv();
    const corsair = corsairForTenant(session.tenantId);

    const labelsRes = await corsair.gmail.api.labels.list({ userId: 'me' });
    if (!labelsRes?.labels?.length) {
      throw new Error('Gmail returned no labels — account may need reconnecting');
    }

    let email = session.email || '';
    let messagesTotal = 0;
    let threadsTotal = 0;

    try {
      const accessToken = await (corsair as { gmail?: { keys?: { get_access_token?: () => Promise<string> } } })
        .gmail?.keys?.get_access_token?.();
      if (accessToken) {
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const profile = await res.json();
          email = profile?.emailAddress || email;
          messagesTotal = profile?.messagesTotal || 0;
          threadsTotal = profile?.threadsTotal || 0;
        }
      }
    } catch {
      // Labels succeeded — Gmail is connected even if profile metadata failed.
    }

    return NextResponse.json({
      email,
      messagesTotal,
      threadsTotal,
      connected: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gmail not connected';
    console.error('[gmail/profile] failed:', message);
    return NextResponse.json({
      email: session.email || '',
      messagesTotal: 0,
      threadsTotal: 0,
      connected: false,
      needsGoogle: true,
      reason: formatGmailConnectError(message),
    });
  }
}
