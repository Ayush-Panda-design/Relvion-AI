/**
 * POST /api/webhooks/register — tenant-scoped Gmail + Calendar watches.
 * Webhook URLs include ?tenantId= so Corsair routes events per user.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

function getBaseUrl(): string {
  const explicit = process.env.WEBHOOK_BASE_URL || '';
  if (explicit) return explicit.replace(/\/$/, '');

  const appUrl = process.env.APP_URL || '';
  if (appUrl && !appUrl.includes('localhost')) return appUrl.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL || '';
  if (vercel) return `https://${vercel}`;

  return '';
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  const tenantId = session.tenantId;
  const corsair = corsairForTenant(tenantId);
  const tenantQuery = `tenantId=${encodeURIComponent(tenantId)}`;

  const results: {
    tenantId: string;
    gmail: { ok: boolean; expiresAt?: string; historyId?: string; error?: string };
    calendar: {
      ok: boolean;
      expiresAt?: string;
      channelId?: string;
      resourceId?: string;
      error?: string;
    };
  } = {
    tenantId,
    gmail: { ok: false },
    calendar: { ok: false },
  };

  try {
    const gmailRes = await corsair.gmail.api.users.watch({
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[webhooks/register] Gmail watch failed:', msg);
    results.gmail = { ok: false, error: msg };
  }

  try {
    const channelId = `relvion-cal-${tenantId}-${Date.now()}`;

    const calRes = await corsair.googlecalendar.api.channels.watch({
      calendarId: 'primary',
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: `${baseUrl}/api/webhooks/calendar?${tenantQuery}`,
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[webhooks/register] Calendar watch failed:', msg);
    results.calendar = { ok: false, error: msg };
  }

  const allOk = results.gmail.ok && results.calendar.ok;
  return NextResponse.json(
    {
      ...results,
      endpoints: {
        corsair: `${baseUrl}/api/webhooks?${tenantQuery}`,
        calendar: `${baseUrl}/api/webhooks/calendar?${tenantQuery}`,
      },
    },
    { status: allOk ? 200 : 207 }
  );
}

export async function GET() {
  const session = await getSession();
  const baseUrl = getBaseUrl();
  const tenantQuery = session ? `tenantId=${encodeURIComponent(session.tenantId)}` : null;

  return NextResponse.json({
    baseUrl: baseUrl || null,
    configured: !!baseUrl && !baseUrl.includes('localhost'),
    tenantId: session?.tenantId ?? null,
    endpoints: {
      gmail: baseUrl ? `${baseUrl}/api/webhooks/gmail` : null,
      calendar: baseUrl && tenantQuery ? `${baseUrl}/api/webhooks/calendar?${tenantQuery}` : null,
      corsair: baseUrl && tenantQuery ? `${baseUrl}/api/webhooks?${tenantQuery}` : null,
    },
  });
}
