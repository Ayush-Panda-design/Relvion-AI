/**
 * Parses Gmail advanced search syntax into Corsair DB filters or Gmail API `q` strings.
 * @see https://support.google.com/mail/answer/7190
 */

export type GmailDbFilters = {
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  freeText?: string;
};

export type ParsedGmailQuery = {
  filters: GmailDbFilters;
  /** Operators that cannot be expressed via corsair.gmail.db.messages.search */
  requiresGmailApi: boolean;
  /** Full query for Gmail API fallback */
  gmailQ: string;
  /** Human-readable list of active operators (for UI) */
  operators: string[];
};

const GMAIL_API_ONLY =
  /^(is|in|label|category|has|filename|larger|smaller|size|after|before|older_than|newer_than|rfc822msgid|deliveredto|cc|bcc|list):/i;

const TOKEN_RE =
  /(?:^|\s)(from|to|subject|body|cc|bcc|deliveredto|label|category|is|in|has|filename|after|before|older_than|newer_than|larger|smaller|size|rfc822msgid|list):(?:"([^"]+)"|([^\s]+))/gi;

const DB_MAPPABLE = new Set(['from', 'to', 'subject', 'body']);

function normalizeOperator(op: string): string {
  return op.toLowerCase();
}

/**
 * Split a search string into operator tokens and free text.
 */
export function parseGmailSearchQuery(raw: string): ParsedGmailQuery {
  const gmailQ = raw.trim();
  const operators: string[] = [];
  const filters: GmailDbFilters = {};
  let requiresGmailApi = false;

  if (!gmailQ) {
    return { filters, requiresGmailApi: false, gmailQ: '', operators };
  }

  const consumed: boolean[] = new Array(gmailQ.length).fill(false);
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(gmailQ)) !== null) {
    const op = normalizeOperator(match[1]);
    const value = (match[2] ?? match[3] ?? '').trim();
    if (!value) continue;

    operators.push(`${op}:${value}`);

    for (let i = match.index; i < match.index + match[0].length; i++) {
      consumed[i] = true;
    }

    if (DB_MAPPABLE.has(op)) {
      if (op === 'from') filters.from = value;
      else if (op === 'to') filters.to = value;
      else if (op === 'subject') filters.subject = value;
      else if (op === 'body') filters.body = value;
    } else {
      requiresGmailApi = true;
    }
  }

  const freeText = gmailQ
    .split('')
    .map((ch, i) => (consumed[i] ? ' ' : ch))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  if (freeText) {
    filters.freeText = freeText;
    if (GMAIL_API_ONLY.test(freeText)) {
      requiresGmailApi = true;
    }
  }

  // Label / status filters always need Gmail API `q` semantics
  if (/(\s|^)(is|in|label|category|has):/i.test(gmailQ)) {
    requiresGmailApi = true;
  }

  return { filters, requiresGmailApi, gmailQ, operators };
}

export const GMAIL_SEARCH_HINTS = [
  { op: 'from:', example: 'from:alice@company.com', desc: 'Sender' },
  { op: 'to:', example: 'to:bob@company.com', desc: 'Recipient' },
  { op: 'subject:', example: 'subject:invoice', desc: 'Subject line' },
  { op: 'is:unread', example: 'is:unread', desc: 'Unread mail' },
  { op: 'is:starred', example: 'is:starred', desc: 'Starred' },
  { op: 'has:attachment', example: 'has:attachment', desc: 'With files' },
  { op: 'newer_than:7d', example: 'newer_than:7d', desc: 'Last 7 days' },
] as const;
