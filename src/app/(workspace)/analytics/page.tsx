'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, TrendingUp, Clock, CalendarDays, Inbox, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCached, setCached } from '@/lib/client-cache';
import { ContentProgress } from '@/components/ui/ContentProgress';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

interface AnalyticsData {
  emailsSentThisWeek: number;
  sentDeltaPercent: number;
  emailsReceivedThisWeek: number;
  avgResponseHours: number | null;
  meetingsThisWeek: number;
  inboxTotal: number;
  draftsTotal: number;
  sentTotal: number;
  starredTotal: number;
  indexedEmails: number;
  priorityBreakdown: { URGENT: number; IMPORTANT: number; FYI: number };
  dailyActivity: { date: string; total: number; events: Record<string, number> }[];
  dataSource: string;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof TrendingUp;
}) {
  return (
    <div className={cn('rounded-2xl border p-5', dash.elevated, dash.border)}>
      <div className="mb-3 flex items-center justify-between">
        <span className={cn('text-sm', dash.textMuted)}>{label}</span>
        <Icon size={18} className="text-[#8ab4f8]" strokeWidth={1.75} />
      </div>
      <div className={cn('text-3xl font-normal tabular-nums', dash.text)}>{value}</div>
      {sub && <p className={cn('mt-2 text-xs', dash.textSubtle)}>{sub}</p>}
    </div>
  );
}

function BarChart({
  data,
  max,
  barClass,
}: {
  data: { label: string; value: number }[];
  max: number;
  barClass: string;
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className={cn(dash.textMuted)}>{item.label}</span>
            <span className={cn('tabular-nums', dash.text)}>{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#303134]">
            <div
              className={cn('h-full rounded-full transition-all duration-500', barClass)}
              style={{ width: max > 0 ? `${(item.value / max) * 100}%` : '0%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to load analytics');
      const json = await res.json();
      setCached('analytics', json);
      setData(json);
    } catch {
      if (!silent) toast.error('Could not load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCached<AnalyticsData>('analytics', 5 * 60 * 1000);
    if (cached) {
      setData(cached);
      setLoading(false);
      load(true);
    } else {
      load(false);
    }
  }, [load]);

  const priorityMax = data
    ? Math.max(data.priorityBreakdown.URGENT, data.priorityBreakdown.IMPORTANT, data.priorityBreakdown.FYI, 1)
    : 1;

  const activityMax = data ? Math.max(...data.dailyActivity.map((d) => d.total), 1) : 1;

  const mailboxMax = data
    ? Math.max(data.inboxTotal, data.sentTotal, data.draftsTotal, data.starredTotal, 1)
    : 1;

  return (
      <div className={cn('relative mx-auto max-w-5xl overflow-y-auto px-6 py-8', dash.bg)}>
        <ContentProgress active={refreshing} />

        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className={cn('text-2xl font-normal tracking-tight', dash.text)}>Analytics</h1>
            <p className={cn('mt-1 text-sm', dash.textMuted)}>
              Insights from Gmail, Calendar, and your AI-indexed inbox
            </p>
          </div>
          <button
            type="button"
            onClick={() => load(!!data)}
            disabled={loading || refreshing}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-50',
              dash.compose
            )}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {loading && !data ? (
          <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn('h-28 rounded-2xl', dash.elevated)} />
            ))}
          </div>
        ) : data ? (
          <div className={cn('space-y-5', refreshing && 'opacity-90 transition-opacity')}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                icon={TrendingUp}
                label="Sent this week"
                value={data.emailsSentThisWeek}
                sub={
                  data.sentDeltaPercent >= 0
                    ? `↑ ${data.sentDeltaPercent}% vs last week`
                    : `↓ ${Math.abs(data.sentDeltaPercent)}% vs last week`
                }
              />
              <StatCard
                icon={Clock}
                label="Avg response time"
                value={data.avgResponseHours != null ? `${data.avgResponseHours}h` : '—'}
                sub={
                  data.avgResponseHours != null
                    ? 'Time from receive to reply'
                    : 'Reply to emails to track this'
                }
              />
              <StatCard
                icon={CalendarDays}
                label="Meetings this week"
                value={data.meetingsThisWeek}
                sub={`${data.emailsReceivedThisWeek} received this week`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className={cn('rounded-2xl border p-5', dash.elevated, dash.border)}>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#8ab4f8]" />
                  <h2 className={cn('text-base font-medium', dash.text)}>AI priority breakdown</h2>
                </div>
                <BarChart
                  data={[
                    { label: 'Urgent', value: data.priorityBreakdown.URGENT },
                    { label: 'Important', value: data.priorityBreakdown.IMPORTANT },
                    { label: 'FYI', value: data.priorityBreakdown.FYI },
                  ]}
                  max={priorityMax}
                  barClass="bg-[#8ab4f8]"
                />
                <p className={cn('mt-4 text-xs', dash.textSubtle)}>
                  {data.indexedEmails.toLocaleString()} emails indexed for vector search
                </p>
              </section>

              <section className={cn('rounded-2xl border p-5', dash.elevated, dash.border)}>
                <div className="mb-4 flex items-center gap-2">
                  <Inbox size={18} className="text-[#8ab4f8]" />
                  <h2 className={cn('text-base font-medium', dash.text)}>Mailbox overview</h2>
                </div>
                <BarChart
                  data={[
                    { label: 'Inbox', value: data.inboxTotal },
                    { label: 'Sent', value: data.sentTotal },
                    { label: 'Drafts', value: data.draftsTotal },
                    { label: 'Starred', value: data.starredTotal },
                  ]}
                  max={mailboxMax}
                  barClass="bg-[#669df6]"
                />
              </section>
            </div>

            <section className={cn('rounded-2xl border p-5', dash.elevated, dash.border)}>
              <h2 className={cn('mb-4 text-base font-medium', dash.text)}>Activity — last 7 days</h2>
              {data.dailyActivity.length === 0 ? (
                <p className={cn('text-sm', dash.textMuted)}>
                  No activity yet. Send mail or receive webhooks to see trends here.
                </p>
              ) : (
                <div className="flex h-36 items-end gap-2">
                  {data.dailyActivity.map((day) => (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full min-h-[4px] rounded-t-md bg-[#8ab4f8] transition-all"
                        style={{ height: `${Math.max((day.total / activityMax) * 100, 4)}%` }}
                        title={`${day.total} events`}
                      />
                      <span className={cn('text-[10px]', dash.textSubtle)}>
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div
            className={cn(
              'rounded-2xl border p-10 text-center text-sm',
              dash.elevated,
              dash.border,
              dash.textMuted
            )}
          >
            Connect Gmail and Calendar to view analytics.
          </div>
        )}
      </div>
  );
}
