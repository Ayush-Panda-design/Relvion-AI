/** User-facing Gmail connection errors (hide raw Corsair JSON when possible). */
export function formatGmailConnectError(reason: string): string {
  const lower = reason.toLowerCase();

  if (lower.includes('invalid_client') || lower.includes('unauthorized_client')) {
    return 'Your Google OAuth app credentials changed or no longer match stored Gmail tokens. Click “Connect Google Account” below — this clears old tokens and opens a fresh Google consent screen.';
  }

  if (lower.includes('integration') && lower.includes('not found')) {
    return 'Gmail integration is not provisioned in the database. Run pnpm corsair-setup (local) or /api/corsair/setup on production, then reconnect Google.';
  }

  if (lower.includes('refresh_token') || lower.includes('access token')) {
    return 'Gmail access expired. Click “Connect Google Account” to sign in again.';
  }

  return reason;
}
