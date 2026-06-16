import type { corsairForTenant } from '@/lib/auth/corsairForTenant';
import { parseGmailMessage, toEmailListItem, unwrapGmailMessage } from '@/lib/gmail/parseMessage';
import { clearTenantCache } from '@/lib/tenant-cache';

/** Lightweight headers for list/thread views — avoids downloading MIME bodies. */
export const GMAIL_METADATA_HEADERS = ['From', 'To', 'Subject', 'Date'] as const;

export const GMAIL_LIST_FORMAT = 'metadata' as const;

/** Corsair's Gmail plugin joins metadataHeaders with commas (Gmail needs repeated params). */
export const METADATA_HEADER_FETCHES = ['From', 'Subject', 'Date', 'To'] as const;

const FETCH_CONCURRENCY = 6;
const BATCH_PAUSE_MS = 80;

export const INBOX_MAX_RESULTS = 20;
export const FOLDER_MAX_RESULTS = 20;

type Corsair = ReturnType<typeof corsairForTenant>;

type HeaderLike = { name?: string; value?: string };
type ListItem = ReturnType<typeof toEmailListItem>;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function headerFromMessage(msg: unknown, headerName: string): HeaderLike | null {
  const m = unwrapGmailMessage(msg);
  if (!m?.payload || typeof m.payload !== 'object') return null;
  const headers = (m.payload as { headers?: HeaderLike[] }).headers;
  if (!Array.isArray(headers)) return null;
  const hit = headers.find((h) => (h.name ?? '').toLowerCase() === headerName.toLowerCase());
  if (!hit?.value) return null;
  return { name: headerName, value: hit.value };
}

async function fetchMetadataHeader(
  corsair: Corsair,
  id: string,
  header: string,
  attempts = 2
): Promise<HeaderLike | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await corsair.gmail.api.messages.get({
        id,
        format: GMAIL_LIST_FORMAT,
        metadataHeaders: [header],
      });
      const h = headerFromMessage(res, header);
      if (h) return h;
    } catch {
      /* retry */
    }
    if (i < attempts - 1) await sleep(120 * (i + 1));
  }
  return null;
}

async function fetchMessageBase(corsair: Corsair, id: string) {
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

/** Fetch list-row fields using one metadataHeader per request (Corsair/Gmail quirk). */
async function fetchOneListMessage(corsair: Corsair, id: string): Promise<ListItem | null> {
  const base = await fetchMessageBase(corsair, id);
  const m = unwrapGmailMessage(base);
  if (!m) return null;

  const headerResults = await Promise.allSettled(
    METADATA_HEADER_FETCHES.map((header) => fetchMetadataHeader(corsair, id, header))
  );

  const headers: HeaderLike[] = [];
  for (let i = 0; i < METADATA_HEADER_FETCHES.length; i++) {
    const r = headerResults[i];
    if (r.status === 'fulfilled' && r.value) headers.push(r.value);
  }

  for (const name of ['From', 'Subject'] as const) {
    if (!headers.some((h) => h.name?.toLowerCase() === name.toLowerCase())) {
      const h = await fetchMetadataHeader(corsair, id, name, 3);
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

export async function fetchMessagesByIds(corsair: Corsair, ids: string[]) {
  if (ids.length === 0) return [];

  const emails: ListItem[] = [];
  for (let i = 0; i < ids.length; i += FETCH_CONCURRENCY) {
    if (i > 0) await sleep(BATCH_PAUSE_MS);
    const batch = ids.slice(i, i + FETCH_CONCURRENCY);
    const results = await Promise.allSettled(batch.map((id) => fetchOneListMessage(corsair, id)));
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) emails.push(result.value);
    }
  }
  return emails;
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
