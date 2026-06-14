import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME, type SessionPayload } from './session';

/**
 * Reads and verifies the session cookie on every server-side API route.
 * Returns the session payload (userId, tenantId, email) or null if missing/invalid.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;
    return await verifySessionToken(cookie.value);
  } catch {
    return null;
  }
}
