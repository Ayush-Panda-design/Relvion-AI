'use client';
import { AppShell } from '@/components/layout/AppShell';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

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
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-[#FFF176] border border-[#FBC02D] rounded-2xl p-6">
      <div className="text-green-900 text-sm mb-2">{label}</div>
      <div className="text-3xl font-bold text-red-900">{value}</div>
      {sub && <div className="text-green-800 text-sm mt-2">{sub}</div>}
    </div>
  );
}

function BarChart({
  data,
  max,
  color,
}: {
  data: { label: string; value: number }[];
  max: number;
  color: string;
}) {
  return (
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.label}>
          <div className="flex justify-between text-sm text-green-900 mb-1">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-3 bg-[#FFEE58] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${color}`}
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to load analytics');
      setData(await res.json());
    } catch {
      toast.error('Could not load analytics from live APIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const priorityMax = data
    ? Math.max(data.priorityBreakdown.URGENT, data.priorityBreakdown.IMPORTANT, data.priorityBreakdown.FYI, 1)
    : 1;

  const activityMax = data
    ? Math.max(...data.dailyActivity.map(d => d.total), 1)
    : 1;

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-red">Analytics Dashboard</h1>
            <p className="text-green-500 text-sm mt-1">
              Live metrics from Gmail, Google Calendar, and Postgres
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-[#FFF9C4] rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-[#FFF176]/50 rounded-2xl" />
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                label="Emails Sent (This Week)"
                value={data.emailsSentThisWeek}
                sub={
                  data.sentDeltaPercent >= 0
                    ? `↑ ${data.sentDeltaPercent}% vs last week`
                    : `↓ ${Math.abs(data.sentDeltaPercent)}% vs last week`
                }
              />
              <StatCard
                label="Average Response Time"
                value={data.avgResponseHours != null ? `${data.avgResponseHours}h` : '—'}
                sub={
                  data.avgResponseHours != null
                    ? 'Based on received → reply activity'
                    : 'Reply to emails to build response-time data'
                }
              />
              <StatCard
                label="Meetings This Week"
                value={data.meetingsThisWeek}
                sub={`${data.emailsReceivedThisWeek} emails received this week`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#FFF176] border border-[#FBC02D] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-4">AI Priority Inbox</h2>
                <BarChart
                  data={[
                    { label: 'URGENT', value: data.priorityBreakdown.URGENT },
                    { label: 'IMPORTANT', value: data.priorityBreakdown.IMPORTANT },
                    { label: 'FYI', value: data.priorityBreakdown.FYI },
                  ]}
                  max={priorityMax}
                  color="bg-[#D32F2F]"
                />
                <p className="text-xs text-green-800 mt-4">
                  {data.indexedEmails} emails indexed in pgvector
                </p>
              </div>

              <div className="bg-[#FFF176] border border-[#FBC02D] rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-4">Mailbox Overview</h2>
                <BarChart
                  data={[
                    { label: 'Inbox', value: data.inboxTotal },
                    { label: 'Sent', value: data.sentTotal },
                    { label: 'Drafts', value: data.draftsTotal },
                    { label: 'Starred', value: data.starredTotal },
                  ]}
                  max={Math.max(data.inboxTotal, data.sentTotal, data.draftsTotal, data.starredTotal, 1)}
                  color="bg-green-700"
                />
              </div>
            </div>

            <div className="bg-[#FFF176] border border-[#FBC02D] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-4">Activity (Last 7 Days)</h2>
              {data.dailyActivity.length === 0 ? (
                <p className="text-green-800 text-sm">
                  No activity logged yet. Send emails, save drafts, or receive webhooks to populate this chart.
                </p>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {data.dailyActivity.map(day => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-[#D32F2F] rounded-t-md min-h-[4px]"
                        style={{ height: `${(day.total / activityMax) * 100}%` }}
                        title={`${day.total} events`}
                      />
                      <span className="text-[10px] text-green-900">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-[#FFF176] border border-[#FBC02D] rounded-2xl p-8 text-center text-green-900">
            Connect Gmail and Calendar via Corsair to see live analytics.
          </div>
        )}
      </div>
    </AppShell>
  );
}
