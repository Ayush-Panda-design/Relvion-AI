import { NextResponse } from 'next/server';
import { processOAuthCallback, generateOAuthUrl } from 'corsair/oauth';
import { setupCorsair } from 'corsair/setup';
import { corsair } from '@/server/corsair';
import { ensureCorsairSetup } from '@/server/ensureCorsairSetup';
import { db } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/session';

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Run missing column migrations safely on every cold start
async function ensureSchema() {
  try {
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`);
  } catch (e: any) {
    console.warn('[callback] ensureSchema warning:', e?.message);
  }
}

export async function GET(req: Request) {
  await ensureSchema();

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/signin?error=missing_params`);
  }

  try {
    let tenantId: string;
    // 1. Exchange code for tokens via Corsair
    const result = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri: REDIRECT_URI,
    });
    tenantId = result.tenantId;

    // 2. Get email using the stored access token
    let email = '';
    const tenantCorsair = (corsair as any).withTenant?.(tenantId);
    
    try {
      const accessToken = await tenantCorsair?.gmail?.keys?.get_access_token?.();
      
      if (accessToken) {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          email = userInfo.email || '';
        }
      }
    } catch (e: any) {
      console.warn('[callback] access token email lookup failed:', e?.message);
    }

    if (!email) {
      throw new Error('Could not retrieve email from Google. Please try again.');
    }


    // 3. Upsert user
    let userId: string;
    let finalTenantId = tenantId;

    if (tenantId.startsWith('tmp_')) {
      const stableTenantId = email;
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);

      if (existing.rows.length > 0) {
        userId = String(existing.rows[0].id);
        finalTenantId = stableTenantId;
        await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
      } else {
        userId = crypto.randomUUID();
        finalTenantId = stableTenantId;

        await setupCorsair(corsair as any, { tenantId: stableTenantId });

        const tempClient = (corsair as any).withTenant(tenantId);
        const stableClient = (corsair as any).withTenant(stableTenantId);
        try {
          const accessToken = await tempClient.gmail.keys.get_access_token?.();
          const refreshToken = await tempClient.gmail.keys.get_refresh_token?.();
          if (accessToken) await stableClient.gmail.keys.set_access_token(accessToken);
          if (refreshToken) await stableClient.gmail.keys.set_refresh_token(refreshToken);
        } catch (e: any) {
          console.warn('[callback] token transfer warning:', e?.message);
        }

        await db.query(
          `INSERT INTO users (id, tenant_id, email, name, avatar_url, created_at, last_login)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [userId, stableTenantId, email, email.split('@')[0], null],
        );
      }
    } else {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        userId = String(existing.rows[0].id);
        finalTenantId = tenantId;
        await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
      } else {
        // Linking Google to an existing password account, or first-time connect from dashboard
        userId = crypto.randomUUID();
        finalTenantId = email;

        await setupCorsair(corsair as any, { tenantId: finalTenantId });

        const sourceClient = (corsair as any).withTenant(tenantId);
        const stableClient = (corsair as any).withTenant(finalTenantId);
        try {
          const accessToken = await sourceClient.gmail.keys.get_access_token?.();
          const refreshToken = await sourceClient.gmail.keys.get_refresh_token?.();
          if (accessToken) await stableClient.gmail.keys.set_access_token(accessToken);
          if (refreshToken) await stableClient.gmail.keys.set_refresh_token(refreshToken);
        } catch (e: any) {
          console.warn('[callback] token transfer warning:', e?.message);
        }

        await db.query(
          `INSERT INTO users (id, tenant_id, email, name, avatar_url, created_at, last_login)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [userId, finalTenantId, email, email.split('@')[0], null],
        );
      }
      await setupCorsair(corsair as any, { tenantId: finalTenantId });
    }

    // 4. Try to connect Google Calendar too
    try {
      await ensureCorsairSetup(finalTenantId);
      const calResult = await generateOAuthUrl(corsair, 'googlecalendar', {
        tenantId: finalTenantId,
        redirectUri: `${APP_URL}/api/auth/calendar/callback`,
      });
      const res = NextResponse.redirect(calResult.url);
      const token = await createSessionToken({ userId, tenantId: finalTenantId, email });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        path: '/',
      });
      res.cookies.set('pending_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600,
        sameSite: 'lax',
        path: '/',
      });
      res.cookies.set('oauth_state', calResult.state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600,
        sameSite: 'lax',
        path: '/',
      });
      return res;
    } catch {
      // Calendar optional — continue to dashboard
    }

    // 5. Set session and redirect to dashboard
    const token = await createSessionToken({ userId, tenantId: finalTenantId, email });
    const res = NextResponse.redirect(`${APP_URL}/dashboard`);
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
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