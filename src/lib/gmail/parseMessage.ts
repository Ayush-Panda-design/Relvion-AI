import { extractBody } from '@/lib/gmail/extractBody';

export function parseDisplayName(from: string): string {
  if (!from) return 'Unknown Sender';
  const match = from.match(/^([^<]+)</);
  if (match && match[1].trim()) return match[1].trim().replace(/^["']|["']$/g, '');
  const emailOnly = from.replace(/[<>]/g, '').trim();
  if (emailOnly.includes('@')) {
    return emailOnly.split('@')[0] || emailOnly;
  }
  return emailOnly || 'Unknown Sender';
}

export function parseEmailAddress(from: string): string {
  if (!from) return '';
  const match = from.match(/<([^>]+)>/);
  if (match) return match[1].trim();
  return from.replace(/[<>]/g, '').trim();
}

export type ParsedMessage = {
  id: string;
  threadId?: string;
  labelIds: string[];
  snippet: string;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  date: string;
  body: string;
  bodyText?: string;
  bodyHtml?: string;
  isUnread: boolean;
};

type HeaderLike = { name?: string; Name?: string; value?: string; Value?: string };

function readHeader(headers: HeaderLike[], name: string): string {
  const key = name.toLowerCase();
  for (const h of headers) {
    const n = (h.name ?? h.Name ?? '').toLowerCase();
    if (n === key) return (h.value ?? h.Value ?? '').trim();
  }
  return '';
}

/** Unwrap Corsair / API envelopes until we reach a Gmail message object. */
export function unwrapGmailMessage(msg: unknown): Record<string, unknown> | null {
  let current: unknown = msg;

  for (let depth = 0; depth < 5; depth++) {
    if (!current || typeof current !== 'object') return null;
    const o = current as Record<string, unknown>;

    if (typeof o.id === 'string' && (o.payload || o.snippet !== undefined || o.labelIds)) {
      return o;
    }

    if (o.data && typeof o.data === 'object') {
      current = o.data;
      continue;
    }
    if (o.message && typeof o.message === 'object') {
      current = o.message;
      continue;
    }
    if (o.result && typeof o.result === 'object') {
      current = o.result;
      continue;
    }

    if (typeof o.id === 'string') return o;
    return null;
  }

  return null;
}

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

export function parseGmailMessage(msg: unknown): ParsedMessage | null {
  const m = unwrapGmailMessage(msg);
  if (!m || typeof m.id !== 'string') return null;

  const headers = collectHeaders(m);
  const rawFrom = readHeader(headers, 'From');
  const subject = readHeader(headers, 'Subject');
  const payload = (m.payload || {}) as Parameters<typeof extractBody>[0];
  const { text, html } = extractBody(payload);

  return {
    id: m.id,
    threadId: typeof m.threadId === 'string' ? m.threadId : undefined,
    labelIds: Array.isArray(m.labelIds) ? (m.labelIds as string[]) : [],
    snippet: typeof m.snippet === 'string' ? m.snippet : '',
    subject: subject || '(no subject)',
    from: parseDisplayName(rawFrom),
    fromEmail: parseEmailAddress(rawFrom),
    to: readHeader(headers, 'To'),
    date: readHeader(headers, 'Date') || new Date().toISOString(),
    body: (typeof m.snippet === 'string' ? m.snippet : '') || text || '',
    bodyText: text,
    bodyHtml: html,
    isUnread: Array.isArray(m.labelIds) && (m.labelIds as string[]).includes('UNREAD'),
  };
}

export function toEmailListItem(parsed: ParsedMessage) {
  return {
    id: parsed.id,
    threadId: parsed.threadId,
    labelIds: parsed.labelIds,
    data: {
      subject: parsed.subject,
      from: parsed.from,
      fromEmail: parsed.fromEmail,
      to: parsed.to,
      date: parsed.date,
      body: parsed.body,
      unread: parsed.isUnread,
    },
  };
}
