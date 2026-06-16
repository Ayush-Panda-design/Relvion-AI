import type { EmailItem } from '@/hooks/useFolderEmails';

export type GroupedEmailItem = EmailItem & { messageCount?: number };

/** Collapse list rows that share a Gmail threadId (keeps newest row per thread). */
export function groupEmailsByThread(emails: EmailItem[]): GroupedEmailItem[] {
  const map = new Map<string, GroupedEmailItem>();

  for (const email of emails) {
    const key = email.threadId || email.id;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...email, messageCount: 1 });
    } else {
      existing.messageCount = (existing.messageCount || 1) + 1;
    }
  }

  return Array.from(map.values());
}
