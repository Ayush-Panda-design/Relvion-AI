import type { ParsedGmailQuery } from '@/lib/gmail-search-parser';

type CorsairTenant = {
  gmail: {
    db: {
      messages: {
        search: (options: {
          data?: Record<string, unknown>;
          limit?: number;
          offset?: number;
        }) => Promise<GmailMessageEntity[]>;
      };
    };
    api: {
      messages: {
        list: (args: { q?: string; maxResults?: number }) => Promise<{
          messages?: { id: string }[];
        }>;
        get: (args: { id: string; format?: string }) => Promise<GmailApiMessage | null>;
      };
    };
  };
  googlecalendar?: {
    db: {
      events: {
        search: (options: {
          data?: Record<string, unknown>;
          limit?: number;
        }) => Promise<CalendarEventEntity[]>;
      };
    };
  };
};

type GmailMessageEntity = {
  entity_id: string;
  data: {
    id?: string;
    subject?: string;
    snippet?: string;
    body?: string;
    from?: string;
    to?: string;
    labelIds?: string[];
  };
};

type CalendarEventEntity = {
  entity_id: string;
  data: {
    id?: string;
    summary?: string;
    description?: string;
    location?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
  };
};

type GmailApiMessage = {
  id?: string;
  snippet?: string;
  payload?: { headers?: { name?: string; value?: string }[] };
};

export type UnifiedSearchResult = {
  id: string;
  type: 'email' | 'event';
  subject: string;
  body_preview: string;
  sender: string;
  similarity: number;
  startDateTime?: string;
};

function messageToResult(entity: GmailMessageEntity, score = 1): UnifiedSearchResult {
  const d = entity.data;
  return {
    id: d.id || entity.entity_id,
    type: 'email',
    subject: d.subject || '(no subject)',
    body_preview: (d.snippet || d.body || '').substring(0, 160),
    sender: d.from || 'Unknown',
    similarity: score,
  };
}

function eventToResult(entity: CalendarEventEntity): UnifiedSearchResult {
  const d = entity.data;
  const start = d.start?.dateTime || d.start?.date;
  return {
    id: d.id || entity.entity_id,
    type: 'event',
    subject: d.summary || '(no title)',
    body_preview: (d.description || d.location || '').substring(0, 160),
    sender: 'Calendar',
    similarity: 1,
    startDateTime: start,
  };
}

function dedupeMessages(entities: GmailMessageEntity[]): GmailMessageEntity[] {
  const seen = new Set<string>();
  const out: GmailMessageEntity[] = [];
  for (const e of entities) {
    const key = e.entity_id || e.data.id || '';
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

/**
 * Search cached Gmail messages via Corsair's typed DB search API.
 * Uses parallel field searches for free-text (OR semantics across subject/body/snippet/from).
 */
export async function searchGmailViaCorsairDb(
  corsair: CorsairTenant,
  parsed: ParsedGmailQuery,
  limit = 10
): Promise<UnifiedSearchResult[]> {
  const { filters } = parsed;
  const hasStructured =
    Boolean(filters.from || filters.to || filters.subject || filters.body);

  if (hasStructured) {
    const data: Record<string, unknown> = {};
    if (filters.from) data.from = { contains: filters.from };
    if (filters.to) data.to = { contains: filters.to };
    if (filters.subject) data.subject = { contains: filters.subject };
    if (filters.body) data.body = { contains: filters.body };

    const entities = await corsair.gmail.db.messages.search({ data, limit });
    return dedupeMessages(entities).map((e) => messageToResult(e));
  }

  if (filters.freeText) {
    const text = filters.freeText;
    const perField = Math.ceil(limit * 1.5);
    const [bySubject, byBody, bySnippet, byFrom] = await Promise.all([
      corsair.gmail.db.messages.search({
        data: { subject: { contains: text } },
        limit: perField,
      }),
      corsair.gmail.db.messages.search({
        data: { body: { contains: text } },
        limit: perField,
      }),
      corsair.gmail.db.messages.search({
        data: { snippet: { contains: text } },
        limit: perField,
      }),
      corsair.gmail.db.messages.search({
        data: { from: { contains: text } },
        limit: perField,
      }),
    ]);

    return dedupeMessages([...bySubject, ...byBody, ...bySnippet, ...byFrom])
      .slice(0, limit)
      .map((e) => messageToResult(e));
  }

  const recent = await corsair.gmail.db.messages.search({ limit });
  return dedupeMessages(recent).slice(0, limit).map((e) => messageToResult(e));
}

/**
 * Search cached calendar events via Corsair DB search.
 */
export async function searchCalendarViaCorsairDb(
  corsair: CorsairTenant,
  query: string,
  limit = 5
): Promise<UnifiedSearchResult[]> {
  if (!corsair.googlecalendar?.db?.events) return [];
  const text = query.trim();
  if (!text) return [];

  const [bySummary, byDescription, byLocation] = await Promise.all([
    corsair.googlecalendar.db.events.search({
      data: { summary: { contains: text } },
      limit,
    }),
    corsair.googlecalendar.db.events.search({
      data: { description: { contains: text } },
      limit,
    }),
    corsair.googlecalendar.db.events.search({
      data: { location: { contains: text } },
      limit,
    }),
  ]);

  const seen = new Set<string>();
  const merged: CalendarEventEntity[] = [];
  for (const e of [...bySummary, ...byDescription, ...byLocation]) {
    const key = e.entity_id || e.data.id || '';
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(e);
  }

  return merged.slice(0, limit).map(eventToResult);
}

function getHeader(msg: GmailApiMessage, name: string): string {
  const headers = msg.payload?.headers || [];
  return (
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || ''
  );
}

/**
 * Gmail advanced search via live API (for operators like is:unread, has:attachment).
 */
export async function searchGmailViaApi(
  corsair: CorsairTenant,
  q: string,
  limit = 10
): Promise<UnifiedSearchResult[]> {
  const listRes = await corsair.gmail.api.messages.list({ q, maxResults: limit });
  const messageIds = (listRes?.messages || []).map((m) => m.id).filter(Boolean);
  if (messageIds.length === 0) return [];

  const results: UnifiedSearchResult[] = [];
  for (let i = 0; i < messageIds.length; i += 5) {
    const batch = messageIds.slice(i, i + 5);
    const msgs = await Promise.all(
      batch.map((id) => corsair.gmail.api.messages.get({ id, format: 'full' }))
    );
    for (const msg of msgs) {
      if (!msg?.id) continue;
      results.push({
        id: msg.id,
        type: 'email',
        subject: getHeader(msg, 'Subject') || '(no subject)',
        body_preview: (msg.snippet || '').substring(0, 160),
        sender: getHeader(msg, 'From') || 'Unknown',
        similarity: 1,
      });
    }
  }
  return results;
}
