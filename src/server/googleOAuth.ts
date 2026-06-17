import { corsair } from '@/server/corsair';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';

type IntegrationKeys = {
  set_client_id: (value: string | null) => Promise<void>;
  set_client_secret: (value: string | null) => Promise<void>;
  set_redirect_url: (value: string | null) => Promise<void>;
};

type AccountKeys = {
  set_access_token: (value: string | null) => Promise<void>;
  set_refresh_token: (value: string | null) => Promise<void>;
  set_expires_at: (value: string | null) => Promise<void>;
};

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
}

/** Always overwrite integration OAuth app credentials from env (fixes stale DB secrets). */
export async function syncGoogleOAuthCredentialsFromEnv(): Promise<boolean> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return false;

  const base = appBaseUrl();
  const integrationKeys = (corsair as { keys?: Record<string, IntegrationKeys> }).keys;
  if (!integrationKeys?.gmail || !integrationKeys?.googlecalendar) {
    throw new Error('Corsair integration keys are unavailable');
  }

  await integrationKeys.gmail.set_client_id(clientId);
  await integrationKeys.gmail.set_client_secret(clientSecret);
  await integrationKeys.gmail.set_redirect_url(`${base}/api/auth/google/callback`);

  await integrationKeys.googlecalendar.set_client_id(clientId);
  await integrationKeys.googlecalendar.set_client_secret(clientSecret);
  await integrationKeys.googlecalendar.set_redirect_url(`${base}/api/auth/calendar/callback`);

  return true;
}

/** Remove stale refresh tokens so reconnect issues fresh credentials for the current OAuth client. */
export async function clearTenantGoogleTokens(tenantId: string): Promise<void> {
  const tenant = corsairForTenant(tenantId) as {
    gmail?: { keys?: AccountKeys };
    googlecalendar?: { keys?: AccountKeys };
  };

  for (const keys of [tenant.gmail?.keys, tenant.googlecalendar?.keys]) {
    if (!keys) continue;
    await keys.set_access_token(null);
    await keys.set_refresh_token(null);
    await keys.set_expires_at(null);
  }
}

export function googleOAuthEnvReady(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}
