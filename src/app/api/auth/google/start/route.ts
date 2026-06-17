import { NextResponse } from 'next/server';
import { generateOAuthUrl } from 'corsair/oauth';
import { corsair } from '@/server/corsair';
import { ensureCorsairSetup } from '@/server/ensureCorsairSetup';
import {
  clearTenantGoogleTokens,
  syncGoogleOAuthCredentialsFromEnv,
} from '@/server/googleOAuth';
import { getSession } from '@/lib/auth/getSession';


const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;

/**
 * GET /api/auth/google/start?connect=true
 *
 * Sign-in / sign-up (default): always uses a fresh tmp_ tenant so a new Google
 * account can register even if another user is still logged in on this browser.
 *
 * Dashboard "Connect Google" (?connect=true): reuses the logged-in user's tenant.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const connect = searchParams.get('connect') === 'true';
  const session = await getSession();

  const tenantId =
    connect && session?.tenantId ? session.tenantId : `tmp_${crypto.randomUUID()}`;


  try {
    await ensureCorsairSetup(tenantId);
    await syncGoogleOAuthCredentialsFromEnv();

    if (connect && session?.tenantId) {
      await clearTenantGoogleTokens(session.tenantId);
    }

    // Generate Gmail OAuth URL
    const gmailResult = await generateOAuthUrl(corsair, 'gmail', {
      tenantId: tenantId,
      redirectUri: REDIRECT_URI,
    });

    // Append email and profile scopes to get the id_token in the token exchange
    const urlObj = new URL(gmailResult.url);
    const existingScopes = urlObj.searchParams.get('scope') || '';
    urlObj.searchParams.set('scope', `${existingScopes} email profile`);
    const finalUrl = urlObj.toString();

    // Store temp tenant id in a short-lived cookie so callback can retrieve it
    const res = NextResponse.redirect(finalUrl);
    res.cookies.set('oauth_state', gmailResult.state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 min
      sameSite: 'lax',
      path: '/',
    });
    return res;
  } catch (err: any) {
    console.error('[auth/google/start] Error:', err.message);
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(err.message)}`, req.url),
    );
  }
}
