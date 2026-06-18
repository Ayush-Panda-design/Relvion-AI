import type { corsairForTenant } from '@/lib/auth/corsairForTenant';
import {
  parseDisplayName,
  parseEmailAddress,
  parseGmailMessage,
  toEmailListItem,
  unwrapGmailMessage,
} from '@/lib/gmail/parseMessage';
import { clearTenantCache } from '@/lib/tenant-cache';

/** Lightweight headers for list/thread views — avoids downloading MIME bodies. */
export const GMAIL_METADATA_HEADERS = ['From', 'To', 'Subject', 'Date'] as const;

export const GMAIL_LIST_FORMAT = 'metadata' as const;

/** Request all list headers in a single messages.get when possible. */
export const METADATA_HEADER_FETCHES = ['From', 'Subject', 'Date', 'To'] as const;

const FETCH_CONCURRENCY = 12;

export const INBOX_MAX_RESULTS = 20;
export const FOLDER_MAX_RESULTS = 20;

type Corsair = ReturnType<typeof corsairForTenant>;

type HeaderLike = { name?: string; value?: string };
type ListItem = ReturnType<typeof toEmailListItem>;

type DbMessageEntity = {
  entity_id: string;
  data: {
    id?: string;
    subject?: string;
    snippet?: string;
    body?: string;
    from?: string;
    to?: string;
    date?: string;
    labelIds?: string[];
  };
};

function collectHeaders(msg: Record<string, unknown>): HeaderLike[] {
  const payload = msg.payload as { headers?: HeaderLike[] } | undefined;
  if (Array.isArray(payload?.headers) && payload.headers.length > 0) {
    return payload.headers;
  }
  if (Array.isArray(msg.headers)) {
    return msg.headers as HeaderLike[];
  }
  return [];
}

function hasHeader(headers: HeaderLike[], name: string): boolean {
  const key = name.toLowerCase();
  return headers.some((h) => (h.name ?? '').toLowerCase() === key && Boolean(h.value));
}

async function fetchMetadataHeader(
  corsair: Corsair,
  id: string,
  header: string
): Promise<HeaderLike | null> {
  try {
    const res = await corsair.gmail.api.messages.get({
      id,
      format: GMAIL_LIST_FORMAT,
      metadataHeaders: [header],
    });
    const m = unwrapGmailMessage(res);
    if (!m) return null;
    const headers = collectHeaders(m);
    const hit = headers.find((h) => (h.name ?? '').toLowerCase() === header.toLowerCase());
    if (hit?.value) return { name: header, value: hit.value };
  } catch {
    /* retry via batch below */
  }
  return null;
}

async function fetchMessageMetadata(corsair: Corsair, id: string) {
  try {
    return await corsair.gmail.api.messages.get({
      id,
      format: GMAIL_LIST_FORMAT,
      metadataHeaders: [...METADATA_HEADER_FETCHES],
    });
  } catch {
    try {
      return await corsair.gmail.api.messages.get({ id, format: GMAIL_LIST_FORMAT });
    } catch {
      try {
        return await corsair.gmail.api.messages.get({ id, format: 'minimal' });
      } catch {
        return null;
      }
    }
  }
}

/** One primary Gmail call per row; at most two extra calls if headers are missing. */
async function fetchOneListMessage(corsair: Corsair, id: string): Promise<ListItem | null> {
  const raw = await fetchMessageMetadata(corsair, id);
  const m = unwrapGmailMessage(raw);
  if (!m) return null;

  let headers = collectHeaders(m);

  const missingCritical = (['From', 'Subject'] as const).filter((name) => !hasHeader(headers, name));
  if (missingCritical.length > 0) {
    const extras = await Promise.all(
      missingCritical.map((name) => fetchMetadataHeader(corsair, id, name))
    );
    for (const h of extras) {
      if (h) headers.push(h);
    }
  }

  const parsed = parseGmailMessage({
    ...m,
    payload: { headers },
  });
  if (!parsed) return null;
  return toEmailListItem(parsed);
}

function dbEntityToListItem(entity: DbMessageEntity): ListItem | null {
  const d = entity.data;
  const id = d.id || entity.entity_id;
  if (!id) return null;

  const rawFrom = d.from || '';
  const labelIds = Array.isArray(d.labelIds) ? d.labelIds : [];
  const snippet = d.snippet || d.body || '';

  return {
    id,
    threadId: undefined,
    labelIds,
    data: {
      subject: d.subject || '(no subject)',
      from: rawFrom ? parseDisplayName(rawFrom) : 'Unknown Sender',
      fromEmail: rawFrom ? parseEmailAddress(rawFrom) : '',
      to: d.to || '',
      date: d.date || '',
      body: snippet,
      unread: labelIds.includes('UNREAD'),
    },
  };
}

/** Build a fast lookup from Corsair's cached Gmail DB (single query). */
export async function buildDbMessageIndex(corsair: Corsair): Promise<Map<string, ListItem>> {
  const index = new Map<string, ListItem>();
  const db = (corsair as { gmail?: { db?: { messages?: { search: (q: { limit?: number }) => Promise<DbMessageEntity[]> } } } })
    .gmail?.db?.messages;

  if (!db?.search) return index;

  try {
    const entities = await db.search({ limit: 120 });
    for (const entity of entities) {
      const item = dbEntityToListItem(entity);
      if (item) index.set(item.id, item);
    }
  } catch {
    /* DB cache optional */
  }

  return index;
}

export function isListItemComplete(item: ListItem): boolean {
  const from = item.data?.from;
  const subject = item.data?.subject;
  const okFrom = Boolean(from && from !== 'Unknown Sender');
  const okSubject = Boolean(subject && subject !== '(no subject)');
  return okFrom && okSubject;
}

export function shouldCacheList(emails: ListItem[]): boolean {
  if (emails.length === 0) return true;
  const complete = emails.filter(isListItemComplete).length;
  return complete / emails.length >= 0.85;
}

export function messageToListItem(msg: unknown) {
  const parsed = parseGmailMessage(msg);
  if (parsed) return toEmailListItem(parsed);
  return null;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function fetchMessagesByIds(
  corsair: Corsair,
  ids: string[],
  dbIndex?: Map<string, ListItem>
) {
  if (ids.length === 0) return [];

  const index = dbIndex ?? (await buildDbMessageIndex(corsair));
  const needApi: string[] = [];
  const prefilled = new Map<string, ListItem>();

  for (const id of ids) {
    const cached = index.get(id);
    if (cached && isListItemComplete(cached)) {
      prefilled.set(id, cached);
    } else {
      needApi.push(id);
    }
  }

  const apiResults = await mapWithConcurrency(needApi, FETCH_CONCURRENCY, async (id) => {
    try {
      return await fetchOneListMessage(corsair, id);
    } catch {
      return null;
    }
  });

  const apiById = new Map<string, ListItem>();
  for (let i = 0; i < needApi.length; i++) {
    const item = apiResults[i];
    if (item) apiById.set(needApi[i], item);
  }

  return ids
    .map((id) => prefilled.get(id) ?? apiById.get(id))
    .filter((item): item is ListItem => Boolean(item));
}

export function listCacheKey(folder: string) {
  return `gmail-list:v5:${folder}`;
}

export function clearGmailListCaches(tenantId: string) {
  const folders = ['inbox', 'sent', 'drafts', 'spam', 'trash', 'snoozed'];
  for (const folder of folders) {
    clearTenantCache(tenantId, listCacheKey(folder));
  }
}
