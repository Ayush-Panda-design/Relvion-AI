import { describe, it, expect } from 'vitest';
import { parseGmailSearchQuery } from '@/lib/gmail-search-parser';

describe('gmail-search-parser', () => {
  it('maps from: operator to DB filter', () => {
    const parsed = parseGmailSearchQuery('from:alice@example.com');
    expect(parsed.filters.from).toBe('alice@example.com');
    expect(parsed.requiresGmailApi).toBe(false);
  });

  it('flags label: as requiring Gmail API', () => {
    const parsed = parseGmailSearchQuery('label:important');
    expect(parsed.requiresGmailApi).toBe(true);
    expect(parsed.operators).toContain('label:important');
  });

  it('extracts free text alongside operators', () => {
    const parsed = parseGmailSearchQuery('subject:invoice quarterly report');
    expect(parsed.filters.subject).toBe('invoice');
    expect(parsed.filters.freeText).toBe('quarterly report');
  });
});
