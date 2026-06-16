'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getCached, setCached } from '@/lib/client-cache';

export type CalEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: { email: string }[];
  description?: string;
};

type CalendarResponse = { events?: CalEvent[] };
const CAL_TTL = 3 * 60 * 1000;

export function prefetchCalendarEvents() {
  const key = 'calendar:events';
  if (getCached<CalendarResponse>(key, CAL_TTL)) return;
  fetch('/api/calendar/list')
    .then((r) => (r.ok ? r.json() : null))
    .then((data: CalendarResponse | null) => {
      if (data) setCached(key, data);
    })
    .catch(() => {});
}

export function useCalendarEvents() {
  const cacheKey = 'calendar:events';
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const eventsRef = useRef(events);
  const fetchingRef = useRef(false);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const fetchEvents = useCallback(async (opts?: { silent?: boolean }) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const silent = opts?.silent ?? eventsRef.current.length > 0;
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/calendar/list');
      if (!res.ok) throw new Error('Calendar fetch failed');
      const data: CalendarResponse = await res.json();
      const list = data.events || [];
      setCached(cacheKey, { events: list });
      setEvents(list);
    } catch {
      if (!silent) toast.error('Failed to load calendar events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const hit = getCached<CalendarResponse>(cacheKey, CAL_TTL);
    if (hit?.events) {
      setEvents(hit.events);
      setLoading(false);
      fetchEvents({ silent: true });
    } else {
      fetchEvents({ silent: false });
    }
  }, [fetchEvents]);

  return { events, loading, refreshing, fetchEvents };
}
