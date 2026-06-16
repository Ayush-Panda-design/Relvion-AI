import type { EmailItem } from '@/hooks/useFolderEmails';

export type GroupedEmailItem = EmailItem & { messageCount?: number };

function rowQuality(e: EmailItem): number {
  let score = 0;
  const sub = e.data?.subject;
  const from = e.data?.from;
  if (sub && sub !== '(no subject)') score += 10;
  if (from && from !== 'Unknown Sender') score += 5;
  const t = new Date(e.data?.date || 0).getTime();
  if (!Number.isNaN(t)) score += t / 1e12;
  return score;
}

/** Collapse threads — keep the row with the best metadata (subject/from), then newest date. */
export function groupEmailsByThread(emails: EmailItem[]): GroupedEmailItem[] {
  const map = new Map<string, GroupedEmailItem>();

  for (const email of emails) {
    const key = email.threadId || email.id;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...email, messageCount: 1 });
      continue;
    }

    const count = (existing.messageCount || 1) + 1;
    const keep = rowQuality(email) >= rowQuality(existing) ? email : existing;
    map.set(key, { ...keep, messageCount: count });
  }

  return Array.from(map.values());
}
