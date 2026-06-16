'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getCached, setCached, runWhenIdle, invalidateCache } from '@/lib/client-cache';

export type EmailItem = {
  id: string;
  threadId?: string;
  priority?: string;
  data?: {
    from?: string;
    fromEmail?: string;
    subject?: string;
    body?: string;
    date?: string;
    unread?: boolean;
  };
  snippet?: string;
};

type ListResponse = { emails?: EmailItem[] };

const TRIAGE_CACHE_PREFIX = 'relvion:triage:';
const TRIAGE_MAX = 8;
const FOLDER_TTL = 3 * 60 * 1000;

function cacheKeyFor(folder: string) {
  return `emails:v5:${folder}`;
}

function isGoodSubject(subject?: string) {
  return Boolean(subject && subject !== '(no subject)');
}

function isGoodFrom(from?: string) {
  return Boolean(from && from !== 'Unknown Sender');
}

/** Keep richer metadata when a refresh returns partial rows. */
function mergeEmailLists(prev: EmailItem[], next: EmailItem[]): EmailItem[] {
  if (prev.length === 0) return next;
  const prevById = new Map(prev.map((e) => [e.id, e]));
  return next.map((e) => {
    const old = prevById.get(e.id);
    if (!old?.data || !e.data) return e;
    return {
      ...e,
      data: {
        ...e.data,
        subject: isGoodSubject(e.data.subject) ? e.data.subject : old.data.subject,
        from: isGoodFrom(e.data.from) ? e.data.from : old.data.from,
        fromEmail: e.data.fromEmail || old.data.fromEmail,
        date: e.data.date || old.data.date,
        body: e.data.body || old.data.body,
        unread: e.data.unread ?? old.data.unread,
      },
    };
  });
}

function triageCacheKey(id: string) {
  return `${TRIAGE_CACHE_PREFIX}${id}`;
}

function readTriagePriority(id: string): string | undefined {
  try {
    return sessionStorage.getItem(triageCacheKey(id)) || undefined;
  } catch {
    return undefined;
  }
}

function writeTriagePriority(id: string, priority: string) {
  try {
    sessionStorage.setItem(triageCacheKey(id), priority);
  } catch {
    /* ignore */
  }
}

function applyCachedPriorities(emails: EmailItem[]): EmailItem[] {
  return emails.map((e) => {
    const cached = readTriagePriority(e.id);
    return cached ? { ...e, priority: cached } : e;
  });
}

function readFolderCache(folder: string): EmailItem[] {
  const hit = getCached<ListResponse>(cacheKeyFor(folder), FOLDER_TTL);
  return hit?.emails?.length ? applyCachedPriorities(hit.emails) : [];
}

async function triageInBackground(
  folder: string,
  emails: EmailItem[],
  onUpdate: (id: string, priority: string) => void
) {
  if (folder !== 'inbox') return;

  const needsTriage = emails
    .filter((e) => !e.priority && !readTriagePriority(e.id))
    .slice(0, TRIAGE_MAX);

  if (needsTriage.length === 0) return;

  const batchSize = 3;
  for (let i = 0; i < needsTriage.length; i += batchSize) {
    const batch = needsTriage.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (email) => {
        try {
          const res = await fetch('/api/gmail/triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: email.data?.subject,
              body: email.data?.body || '',
              sender: email.data?.fromEmail || email.data?.from,
            }),
          });
          if (res.ok) {
            const { priority } = await res.json();
            if (priority) {
              writeTriagePriority(email.id, priority);
              onUpdate(email.id, priority);
            }
          }
        } catch {
          /* non-fatal */
        }
      })
    );
  }
}

function scheduleEmbed(emails: EmailItem[]) {
  if (emails.length === 0) return;
  runWhenIdle(() => {
    fetch('/api/gmail/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    }).catch(() => {});
  });
}

export function prefetchFolderEmails(folder: string) {
  const key = cacheKeyFor(folder);
  if (getCached<ListResponse>(key, FOLDER_TTL)) return;
  fetch(`/api/gmail/list?folder=${folder}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data: ListResponse | null) => {
      if (data?.emails?.length) {
        setCached(key, { emails: applyCachedPriorities(data.emails) });
      }
    })
    .catch(() => {});
}

export function prefetchAllMailFolders() {
  for (const folder of ['inbox', 'drafts', 'sent', 'spam', 'trash']) {
    prefetchFolderEmails(folder);
  }
}

export function useFolderEmails(folder: string) {
  const cacheKey = cacheKeyFor(folder);
  const [emails, setEmails] = useState<EmailItem[]>(() => readFolderCache(folder));
  const [loading, setLoading] = useState(() => readFolderCache(folder).length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [triaging, setTriaging] = useState<Set<string>>(new Set());
  const emailsRef = useRef(emails);
  const fetchingRef = useRef(false);

  useEffect(() => {
    emailsRef.current = emails;
  }, [emails]);

  const fetchEmails = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      const silent = opts?.silent ?? emailsRef.current.length > 0;
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        if (folder === 'inbox') {
          fetch('/api/gmail/snooze/release', { method: 'POST' }).catch(() => {});
        }

        const res = await fetch(`/api/gmail/list?folder=${folder}`);
        if (!res.ok) throw new Error('Failed to load emails');
        const data: ListResponse & { error?: string } = await res.json();
        if (data.error && !(data.emails?.length)) {
          throw new Error(data.error);
        }
        const fetched = mergeEmailLists(
          emailsRef.current,
          applyCachedPriorities(data.emails || [])
        );
        const mostlyComplete =
          fetched.length === 0 ||
          fetched.filter(
            (e) => isGoodSubject(e.data?.subject) && isGoodFrom(e.data?.from)
          ).length /
            fetched.length >=
            0.85;

        if (fetched.length > 0 && mostlyComplete) {
          setCached(cacheKey, { emails: fetched });
        } else if (fetched.length === 0) {
          invalidateCache(`emails:v5:${folder}`);
        }
        setEmails(fetched);

        scheduleEmbed(fetched);

        const toTriage = fetched.filter((e) => !e.priority);
        setTriaging(new Set(toTriage.map((e) => e.id)));
        runWhenIdle(() => {
          triageInBackground(folder, fetched, (id, priority) => {
            setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, priority } : e)));
            setTriaging((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }).finally(() => setTriaging(new Set()));
        });
      } catch {
        if (!silent) toast.error('Failed to load emails. Check your connection.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        fetchingRef.current = false;
      }
    },
    [folder, cacheKey]
  );

  useEffect(() => {
    const cached = readFolderCache(folder);
    if (cached.length > 0) {
      setEmails(cached);
      setLoading(false);
      fetchEmails({ silent: true });
    } else {
      setEmails([]);
      fetchEmails({ silent: false });
    }
  }, [folder, fetchEmails]);

  return { emails, loading, refreshing, triaging, fetchEmails };
}
