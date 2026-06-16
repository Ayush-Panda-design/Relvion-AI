import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTenantCache,
  setTenantCache,
  clearTenantCache,
} from '@/lib/tenant-cache';

describe('tenant-cache', () => {
  beforeEach(() => {
    clearTenantCache('tenant-a');
    clearTenantCache('tenant-b');
  });

  it('stores and retrieves per-tenant values', () => {
    setTenantCache('tenant-a', 'counts', { inbox: 5 }, 60_000);
    setTenantCache('tenant-b', 'counts', { inbox: 99 }, 60_000);

    expect(getTenantCache<{ inbox: number }>('tenant-a', 'counts')?.inbox).toBe(5);
    expect(getTenantCache<{ inbox: number }>('tenant-b', 'counts')?.inbox).toBe(99);
  });

  it('returns null after TTL expires', () => {
    setTenantCache('tenant-a', 'x', 1, -1);
    expect(getTenantCache('tenant-a', 'x')).toBeNull();
  });

  it('clears a single key for a tenant', () => {
    setTenantCache('tenant-a', 'k1', 1, 60_000);
    setTenantCache('tenant-a', 'k2', 2, 60_000);
    clearTenantCache('tenant-a', 'k1');
    expect(getTenantCache('tenant-a', 'k1')).toBeNull();
    expect(getTenantCache('tenant-a', 'k2')).toBe(2);
  });
});
