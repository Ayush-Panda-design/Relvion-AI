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
  const key = `emails:v2:${folder}`;
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

export function useFolderEmails(folder: string) {
  const cacheKey = `emails:v2:${folder}`;
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
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
        const fetched = applyCachedPriorities(data.emails || []);
        if (fetched.length > 0) {
          setCached(cacheKey, { emails: fetched });
        } else {
          invalidateCache(`emails:v2:${folder}`);
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
    const hit = getCached<ListResponse>(cacheKey, FOLDER_TTL);
    if (hit?.emails?.length) {
      setEmails(applyCachedPriorities(hit.emails));
      setLoading(false);
      fetchEmails({ silent: true });
    } else {
      setEmails([]);
      fetchEmails({ silent: false });
    }
  }, [folder, cacheKey, fetchEmails]);

  return { emails, loading, refreshing, triaging, fetchEmails };
}
