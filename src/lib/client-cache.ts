/** Client-side cache for instant navigation (memory + sessionStorage). */

type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

const memory = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function storageKey(key: string) {
  return `relvion:cache:${key}`;
}

export function getCached<T>(key: string, ttlMs = DEFAULT_TTL_MS): T | null {
  const now = Date.now();
  const mem = memory.get(key) as CacheEntry<T> | undefined;
  if (mem && now - mem.fetchedAt < ttlMs) return mem.data;

  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (now - parsed.fetchedAt >= ttlMs) return null;
    memory.set(key, parsed);
    return parsed.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T) {
  const entry: CacheEntry<T> = { data, fetchedAt: Date.now() };
  memory.set(key, entry);
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    /* quota — memory cache still works */
  }
}

export function invalidateCache(prefix: string) {
  for (const key of [...memory.keys()]) {
    if (key.startsWith(prefix)) memory.delete(key);
  }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(storageKey(prefix))) sessionStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}

/** Fire-and-forget prefetch — does not block UI. */
export async function prefetchJson<T>(key: string, url: string, ttlMs = DEFAULT_TTL_MS): Promise<T | null> {
  if (getCached<T>(key, ttlMs)) return getCached<T>(key, ttlMs);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    setCached(key, data);
    return data;
  } catch {
    return null;
  }
}

export function runWhenIdle(fn: () => void) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => fn(), { timeout: 3000 });
  } else {
    setTimeout(fn, 100);
  }
}
