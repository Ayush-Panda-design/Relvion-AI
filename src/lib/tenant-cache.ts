/** Per-tenant in-memory TTL cache — never share entries across tenants. */

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

function cacheKey(tenantId: string, key: string) {
  return `${tenantId}::${key}`;
}

export function getTenantCache<T>(tenantId: string, key: string): T | null {
  const entry = store.get(cacheKey(tenantId, key)) as Entry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(cacheKey(tenantId, key));
    return null;
  }
  return entry.value;
}

export function setTenantCache<T>(tenantId: string, key: string, value: T, ttlMs: number) {
  store.set(cacheKey(tenantId, key), { value, expiresAt: Date.now() + ttlMs });
}

export function clearTenantCache(tenantId: string, key?: string) {
  if (key) {
    store.delete(cacheKey(tenantId, key));
    return;
  }
  const prefix = `${tenantId}::`;
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}
