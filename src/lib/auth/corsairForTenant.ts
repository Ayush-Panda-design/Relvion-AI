import { corsair } from '@/server/corsair';

/**
 * Returns a Corsair instance scoped to the given tenant.
 * All API calls made on this instance use that tenant's stored OAuth tokens —
 * so Gmail/Calendar operations are completely isolated per user.
 */
export function corsairForTenant(tenantId: string) {
  return (corsair as any).withTenant(tenantId);
}
