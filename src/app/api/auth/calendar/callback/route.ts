import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { processOAuthCallback } from 'corsair/oauth';
import { corsair } from '@/server/corsair';
import { createSessionToken, verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/calendar/callback`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * GET /api/auth/calendar/callback?code=…&state=…
 *
 * Second leg of the auth flow — handles Google Calendar OAuth callback.
 * At this point the user is already identified (pending_session cookie).
 * We process the calendar callback so Corsair stores calendar tokens,
 * then finalize the session.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/signin?error=missing_calendar_params`);
  }

  // Retrieve the pending session to know which tenant to configure
  const cookieStore = await cookies();
  const pendingCookie = cookieStore.get('pending_session')?.value;
  console.log('[calendar/callback] pendingCookie is:', pendingCookie);

  if (!pendingCookie) {
    return NextResponse.redirect(`${APP_URL}/signin?error=missing_pending_session`);
  }

  const session = await verifySessionToken(pendingCookie.trim());
  if (!session) {
    return NextResponse.redirect(`${APP_URL}/signin?error=invalid_pending_session`);
  }

  try {
    // Process calendar OAuth — stores tokens in corsair_accounts for this tenant
    await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri: REDIRECT_URI,
    });
  } catch (err: any) {
    console.warn('[auth/calendar/callback] Calendar token exchange failed:', err.message);
    // Non-fatal — still log user in, calendar can be re-connected later
  }

  // Set final session cookie
  const token = await createSessionToken({ 
    userId: session.userId, 
    tenantId: session.tenantId, 
    email: session.email 
  });
  
  const res = NextResponse.redirect(`${APP_URL}/`);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    path: '/',
  });
  res.cookies.delete('pending_session');
  return res;
}
