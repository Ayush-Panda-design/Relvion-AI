/**
 * POST /api/webhooks/register
 *
 * Re-registers Gmail and Google Calendar webhooks with Google.
 * Call this from the Settings page UI or a cron job every ~6 days,
 * since Google webhook watches expire after 7 days.
 *
 * Requires WEBHOOK_BASE_URL in env (set automatically from APP_URL
 * if WEBHOOK_BASE_URL is not explicitly defined).
 *
 * Returns JSON:
 * {
 *   gmail:    { ok: boolean; expiresAt?: string; error?: string }
 *   calendar: { ok: boolean; expiresAt?: string; channelId?: string; resourceId?: string; error?: string }
 * }
 */

import { NextResponse } from 'next/server';
import { corsair } from '@/server/corsair';

// Resolve the public base URL at runtime so this works both in dev
// (with ngrok) and in production (with the real domain).
function getBaseUrl(): string {
  const explicit = process.env.WEBHOOK_BASE_URL || '';
  if (explicit) return explicit.replace(/\/$/, '');

  const appUrl = process.env.APP_URL || '';
  if (appUrl && !appUrl.includes('localhost')) return appUrl.replace(/\/$/, '');

  // In production Next.js (Vercel etc.) VERCEL_URL is always set
  const vercel = process.env.VERCEL_URL || '';
  if (vercel) return `https://${vercel}`;

  return '';
}

export async function POST() {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    return NextResponse.json(
      {
        error:
          'WEBHOOK_BASE_URL is not set. Add it to .env.local pointing to your ngrok or production URL.',
      },
      { status: 400 }
    );
  }

  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    return NextResponse.json(
      {
        error:
          'WEBHOOK_BASE_URL cannot be localhost. Google cannot reach it. Use ngrok: npx ngrok http 3000',
      },
      { status: 400 }
    );
  }

  const results: {
    gmail: { ok: boolean; expiresAt?: string; historyId?: string; error?: string };
    calendar: {
      ok: boolean;
      expiresAt?: string;
      channelId?: string;
      resourceId?: string;
      error?: string;
    };
  } = {
    gmail: { ok: false },
    calendar: { ok: false },
  };

  // ── Gmail ──────────────────────────────────────────────────────────────────
  try {
    const gmailRes = await (corsair as any).gmail.api.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        labelFilterAction: 'include',
        topicName: process.env.GMAIL_PUBSUB_TOPIC || undefined,
      },
    });

    results.gmail = {
      ok: true,
      historyId: gmailRes?.historyId,
      expiresAt: gmailRes?.expiration
        ? new Date(Number(gmailRes.expiration)).toISOString()
        : undefined,
    };

    console.log('[webhooks/register] Gmail watch registered, expires:', results.gmail.expiresAt);
  } catch (err: any) {
    const msg: string = err?.message ?? String(err);
    console.error('[webhooks/register] Gmail watch failed:', msg);
    results.gmail = { ok: false, error: msg };
  }

  // ── Google Calendar ────────────────────────────────────────────────────────
  try {
    const channelId = `relvion-cal-${Date.now()}`;

    const calRes = await (corsair as any).googlecalendar.api.channels.watch({
      calendarId: 'primary',
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: `${baseUrl}/api/webhooks/calendar`,
        token: process.env.CALENDAR_WEBHOOK_TOKEN || 'relvion-calendar-token',
        params: { ttl: '604800' },
      },
    });

    results.calendar = {
      ok: true,
      channelId,
      resourceId: calRes?.resourceId,
      expiresAt: calRes?.expiration
        ? new Date(Number(calRes.expiration)).toISOString()
        : undefined,
    };

    console.log(
      '[webhooks/register] Calendar watch registered, channelId:',
      channelId,
      'expires:',
      results.calendar.expiresAt
    );
  } catch (err: any) {
    const msg: string = err?.message ?? String(err);
    console.error('[webhooks/register] Calendar watch failed:', msg);
    results.calendar = { ok: false, error: msg };
  }

  const allOk = results.gmail.ok && results.calendar.ok;
  return NextResponse.json(results, { status: allOk ? 200 : 207 });
}

// GET — returns current webhook configuration (for the Settings UI to display)
export async function GET() {
  const baseUrl = getBaseUrl();
  return NextResponse.json({
    baseUrl: baseUrl || null,
    configured: !!baseUrl && !baseUrl.includes('localhost'),
    endpoints: {
      gmail: baseUrl ? `${baseUrl}/api/webhooks/gmail` : null,
      calendar: baseUrl ? `${baseUrl}/api/webhooks/calendar` : null,
      corsair: baseUrl ? `${baseUrl}/api/webhooks` : null,
    },
  });
}