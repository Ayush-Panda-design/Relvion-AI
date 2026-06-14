import { NextResponse } from 'next/server';
import { processOAuthCallback, generateOAuthUrl } from 'corsair/oauth';
import { setupCorsair } from 'corsair/setup';
import { corsair } from '@/server/corsair';
import { Pool } from 'pg';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/session';

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Decodes a Google id_token JWT (without verifying signature — for our use,
 * we trust it because we just received it from Google's token endpoint).
 */
function decodeIdToken(idToken: string): Record<string, string> | null {
  try {
    const [, payload] = idToken.split('.');
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

/**
 * GET /api/auth/google/callback?code=…&state=…
 *
 * 1. Calls processOAuthCallback (Corsair) to exchange the code for tokens
 *    and store them encrypted in corsair_accounts for the temp tenantId.
 * 2. Fetches the user's Google profile from Gmail to get sub/email/name.
 * 3. Checks whether this user already exists in our `users` table.
 *    - New user  → INSERT into users, re-key Corsair account to Google sub
 *    - Returning → UPDATE last_login
 * 4. Sets the session cookie and redirects to the dashboard.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/signin?error=missing_params`);
  }

  try {
    // ── 1. Let Corsair exchange the code for tokens (stores in corsair_accounts) ──
    const { tenantId } = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri: REDIRECT_URI,
    });

    // ── 2. Get the user's Google profile using Corsair's tenant-scoped client ──
    const tenantCorsair = (corsair as any).withTenant(tenantId);
    const profile = await tenantCorsair.gmail.api.users.getProfile({ userId: 'me' });
    const email: string = profile?.emailAddress || '';

    if (!email) {
      throw new Error('Could not retrieve Gmail email from Google profile');
    }

    // ── 3. Upsert user in our `users` table ──────────────────────────────────
    // If the tenantId starts with 'tmp_', it's a new user flow. We need to create a user and re-key.
    // If it's a UUID, it's an existing email/password user linking their Google account.
    
    let userId: string;
    let finalTenantId = tenantId;

    if (tenantId.startsWith('tmp_')) {
      const stableTenantId = email; // Derive stable ID for new users

      const existing = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email],
      );

      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        finalTenantId = stableTenantId;
        await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
      } else {
        userId = crypto.randomUUID();
        finalTenantId = stableTenantId;

        // Provision account rows for gmail + googlecalendar under the stable tenantId
        await setupCorsair(corsair as any, { tenantId: stableTenantId });

        // Copy tokens from temp tenantId to the stable tenantId via Corsair keys API
        const tempClient = (corsair as any).withTenant(tenantId);
        const stableClient = (corsair as any).withTenant(stableTenantId);

        try {
          const accessToken = await tempClient.gmail.keys.get_access_token?.();
          const refreshToken = await tempClient.gmail.keys.get_refresh_token?.();
          if (accessToken) await stableClient.gmail.keys.set_access_token(accessToken);
          if (refreshToken) await stableClient.gmail.keys.set_refresh_token(refreshToken);
        } catch (e: any) {
          console.warn('[callback] Token transfer warning:', e?.message);
        }

        await db.query(
          `INSERT INTO users (id, tenant_id, email, name, avatar_url, created_at, last_login)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [userId, stableTenantId, email, email.split('@')[0], null],
        );
      }
    } else {
      // Existing user flow — tenantId is their user ID
      userId = tenantId;
      // Also provision calendar to be safe
      await setupCorsair(corsair as any, { tenantId });
      await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
    }

    // ── 4. Now also connect Google Calendar for this tenant ──────────────────
    // We need a second OAuth flow for calendar. For simplicity in this first
    // implementation, we re-use the same token approach — Gmail and Calendar
    // share Google OAuth so we generate the calendar URL immediately and redirect.
    // The user sees one seamless consent screen covering all scopes.
    //
    // If calendar isn't set up yet, generate the calendar auth URL too.
    try {
      const calResult = await generateOAuthUrl(corsair, 'googlecalendar', {
        tenantId: finalTenantId,
        redirectUri: `${APP_URL}/api/auth/calendar/callback`,
      });
      // Store session-in-progress state so calendar callback knows who this is
      const res = NextResponse.redirect(calResult.url);
      const token = await createSessionToken({ userId, tenantId: finalTenantId, email });
      res.cookies.set('pending_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600,
        sameSite: 'lax',
        path: '/',
      });
      res.cookies.delete('oauth_state');
      return res;
    } catch {
      // Calendar auth failed — still set session and go to dashboard
    }

    // ── 5. Set session cookie → redirect to dashboard ─────────────────────────
    const token = await createSessionToken({ userId, tenantId: finalTenantId, email });
    const res = NextResponse.redirect(`${APP_URL}/`);
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      path: '/',
    });
    res.cookies.delete('oauth_state');
    return res;
  } catch (err: any) {
    console.error('[auth/google/callback] Error:', err.message);
    return NextResponse.redirect(
      `${APP_URL}/signin?error=${encodeURIComponent(err.message || 'auth_failed')}`,
    );
  }
}
