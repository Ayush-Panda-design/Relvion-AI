import { setupCorsair, type SetupCredentials } from 'corsair/setup';
import { corsair } from '@/server/corsair';

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

function googleOAuthCredentials(): SetupCredentials | undefined {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return undefined;

  const base = appUrl().replace(/\/$/, '');
  return {
    gmail: {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_url: `${base}/api/auth/google/callback`,
    },
    googlecalendar: {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_url: `${base}/api/auth/calendar/callback`,
    },
  };
}

/**
 * Ensures corsair_integrations rows exist and optionally stores Google OAuth
 * app credentials from GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
 */
export async function ensureCorsairSetup(tenantId?: string): Promise<void> {
  const credentials = googleOAuthCredentials();

  // Integration rows + shared OAuth credentials must run without tenantId on
  // multi-tenant instances (Corsair rejects integration-level creds with tenant).
  await setupCorsair(corsair as never, { credentials });

  if (tenantId) {
    await setupCorsair(corsair as never, { tenantId });
  }
}
