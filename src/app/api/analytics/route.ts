import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/getSession';
import { corsairForTenant } from '@/lib/auth/corsairForTenant';


function formatGmailDate(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(d: Date): Date {
  const copy = startOfWeek(d);
  copy.setDate(copy.getDate() + 7);
  return copy;
}

async function countGmailSearch(tenantCorsair: any, query: string): Promise<number> {
  try {
    const res = await tenantCorsair.gmail.api.messages.list({
      q: query,
      maxResults: 500,
    });
    return res?.resultSizeEstimate ?? (res?.messages?.length || 0);
  } catch {
    return 0;
  }
}


export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const corsair = corsairForTenant(session.tenantId);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const afterThisWeek = formatGmailDate(weekStart);
  const afterLastWeek = formatGmailDate(lastWeekStart);
  const beforeThisWeek = formatGmailDate(weekStart);


  const [
    emailsSentThisWeek,
    emailsSentLastWeek,
    emailsReceivedThisWeek,
    labelCounts,
    calendarEvents,
    priorityRows,
    dailyActivity,
    avgResponseMs,
    embeddedCount,
  ] = await Promise.all([
    countGmailSearch(corsair, `in:sent after:${afterThisWeek}`),
    countGmailSearch(corsair, `in:sent after:${afterLastWeek} before:${beforeThisWeek}`),
    countGmailSearch(corsair, `in:inbox after:${afterThisWeek}`),
    (corsair as any).gmail.api.labels.list({ userId: 'me' }).catch(() => ({ labels: [] })),
    (corsair as any).googlecalendar.api.events
      .getMany({
        timeMin: weekStart.toISOString(),
        timeMax: weekEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
      })
      .catch(() => ({ items: [] })),
    db
      .query(
        `SELECT priority, COUNT(*)::int AS count
         FROM email_embeddings
         WHERE priority IS NOT NULL
         GROUP BY priority`
      )
      .catch(() => ({ rows: [] })),
    db
      .query(
        `SELECT DATE(created_at) AS day, event_type, COUNT(*)::int AS count
         FROM activity_log
         WHERE created_at >= NOW() - INTERVAL '7 days'
         GROUP BY DATE(created_at), event_type
         ORDER BY day ASC`
      )
      .catch(() => ({ rows: [] })),
    db
      .query(
        `WITH received AS (
           SELECT metadata->>'threadId' AS thread_id, MIN(created_at) AS received_at
           FROM activity_log
           WHERE event_type = 'email_received' AND metadata->>'threadId' IS NOT NULL
           GROUP BY metadata->>'threadId'
         ),
         replied AS (
           SELECT metadata->>'threadId' AS thread_id, MIN(created_at) AS replied_at
           FROM activity_log
           WHERE event_type IN ('email_replied', 'email_sent')
             AND metadata->>'threadId' IS NOT NULL
           GROUP BY metadata->>'threadId'
         )
         SELECT AVG(EXTRACT(EPOCH FROM (replied.replied_at - received.received_at)) * 1000) AS avg_ms
         FROM received
         JOIN replied ON received.thread_id = replied.thread_id
         WHERE replied.replied_at > received.received_at`
      )
      .catch(() => ({ rows: [{ avg_ms: null }] })),
    db.query(`SELECT COUNT(*)::int AS count FROM email_embeddings`).catch(() => ({ rows: [{ count: 0 }] })),
  ]);

  const labels: any[] = labelCounts?.labels || [];
  const labelMap: Record<string, number> = {};
  for (const label of labels) {
    labelMap[label.id] = label.messagesTotal ?? label.messagesUnread ?? 0;
  }

  const priorityBreakdown = { URGENT: 0, IMPORTANT: 0, FYI: 0 };
  for (const row of priorityRows.rows) {
    const key = row.priority as keyof typeof priorityBreakdown;
    if (key in priorityBreakdown) priorityBreakdown[key] = row.count;
  }

  const dailyMap: Record<string, Record<string, number>> = {};
  for (const row of dailyActivity.rows) {
    const day = String(row.day).slice(0, 10);
    if (!dailyMap[day]) dailyMap[day] = {};
    dailyMap[day][row.event_type] = row.count;
  }

  const dailyActivityChart = Object.entries(dailyMap).map(([date, events]) => ({
    date,
    total: Object.values(events).reduce((a, b) => a + b, 0),
    events,
  }));

  const sentDelta =
    emailsSentLastWeek > 0
      ? Math.round(((emailsSentThisWeek - emailsSentLastWeek) / emailsSentLastWeek) * 100)
      : emailsSentThisWeek > 0
        ? 100
        : 0;

  const avgMs = avgResponseMs.rows[0]?.avg_ms;
  const avgResponseHours =
    avgMs != null && Number(avgMs) > 0 ? Math.round((Number(avgMs) / 3600000) * 10) / 10 : null;

  const meetingsThisWeek = (calendarEvents?.items || []).length;

  return NextResponse.json({
    emailsSentThisWeek,
    emailsSentLastWeek,
    sentDeltaPercent: sentDelta,
    emailsReceivedThisWeek,
    avgResponseHours,
    meetingsThisWeek,
    inboxTotal: labelMap.INBOX ?? 0,
    draftsTotal: labelMap.DRAFT ?? 0,
    sentTotal: labelMap.SENT ?? 0,
    starredTotal: labelMap.STARRED ?? 0,
    priorityBreakdown,
    dailyActivity: dailyActivityChart,
    indexedEmails: embeddedCount.rows[0]?.count ?? 0,
    dataSource: 'live',
    weekRange: {
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    },
  });
}
