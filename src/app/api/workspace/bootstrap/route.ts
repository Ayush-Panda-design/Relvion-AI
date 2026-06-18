import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { ensureCorsairSetup } from '@/server/ensureCorsairSetup';
import { syncGoogleOAuthCredentialsFromEnv } from '@/server/googleOAuth';
import { formatGmailConnectError } from '@/lib/gmail-connect-error';
import { getTenantCache, setTenantCache } from '@/lib/tenant-cache';
import { countSnoozedForTenant } from '@/server/services/snooze';

const BOOTSTRAP_CACHE_KEY = 'workspace-bootstrap';
const BOOTSTRAP_TTL_MS = 45_000;
const COUNTS_CACHE_KEY = 'gmail-label-counts';
const COUNTS_TTL_MS = 60_000;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tenantId, email: sessionEmail } = session;
  const cached = getTenantCache<{
    me: { email: string };
    profile: Record<string, unknown>;
    counts: Record<string, number>;
  }>(tenantId, BOOTSTRAP_CACHE_KEY);

  if (cached) {
    return NextResponse.json(cached);
  }

  const corsair = corsairForTenant(tenantId);

  let profile: Record<string, unknown> = {
    email: sessionEmail || '',
    messagesTotal: 0,
    threadsTotal: 0,
    connected: false,
    needsGoogle: true,
  };

  let counts: Record<string, number> = {
    inbox: 0,
    drafts: 0,
    sent: 0,
    trash: 0,
    spam: 0,
    starred: 0,
    snoozed: 0,
  };

  try {
    await ensureCorsairSetup(tenantId);
    await syncGoogleOAuthCredentialsFromEnv();

    const countsCached = getTenantCache<Record<string, number>>(tenantId, COUNTS_CACHE_KEY);

    const [labelsRes, snoozedCount] = await Promise.all([
      corsair.gmail.api.labels.list({ userId: 'me' }),
      countSnoozedForTenant(tenantId).catch(() => 0),
    ]);

    if (!labelsRes?.labels?.length) {
      throw new Error('Gmail returned no labels — account may need reconnecting');
    }

    if (countsCached) {
      counts = { ...countsCached, snoozed: snoozedCount };
    } else {
      const wantedIds: Record<string, string> = {
        INBOX: 'inbox',
        DRAFT: 'drafts',
        SENT: 'sent',
        TRASH: 'trash',
        SPAM: 'spam',
        STARRED: 'starred',
      };

      for (const label of labelsRes.labels) {
        const key = label.id ? wantedIds[label.id] : undefined;
        if (key) {
          counts[key] =
            key === 'inbox'
              ? label.messagesTotal || label.messagesUnread || 0
              : label.messagesUnread !== undefined
                ? label.messagesUnread
                : label.messagesTotal || 0;
        }
      }
      counts.snoozed = snoozedCount;
      setTenantCache(tenantId, COUNTS_CACHE_KEY, counts, COUNTS_TTL_MS);
    }

    let email = sessionEmail || '';
    let messagesTotal = 0;
    let threadsTotal = 0;

    try {
      const accessToken = await (
        corsair as { gmail?: { keys?: { get_access_token?: () => Promise<string> } } }
      ).gmail?.keys?.get_access_token?.();
      if (accessToken) {
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const gmailProfile = await res.json();
          email = gmailProfile?.emailAddress || email;
          messagesTotal = gmailProfile?.messagesTotal || 0;
          threadsTotal = gmailProfile?.threadsTotal || 0;
        }
      }
    } catch {
      /* labels succeeded — connected */
    }

    profile = {
      email,
      messagesTotal,
      threadsTotal,
      connected: true,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gmail not connected';
    console.error('[workspace/bootstrap] failed:', message);
    profile = {
      email: sessionEmail || '',
      messagesTotal: 0,
      threadsTotal: 0,
      connected: false,
      needsGoogle: true,
      reason: formatGmailConnectError(message),
    };
  }

  const payload = {
    me: { email: (profile.email as string) || sessionEmail || '' },
    profile,
    counts,
  };

  if (profile.connected) {
    setTenantCache(tenantId, BOOTSTRAP_CACHE_KEY, payload, BOOTSTRAP_TTL_MS);
  }

  return NextResponse.json(payload);
}
