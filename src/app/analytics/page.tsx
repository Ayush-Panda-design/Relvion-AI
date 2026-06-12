'use client';
import { AppShell } from '@/components/layout/AppShell';

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
            <div className="text-slate-400 text-sm mb-2">Emails Sent (This Week)</div>
            <div className="text-3xl font-bold text-white">142</div>
            <div className="text-green-400 text-sm mt-2">↑ 12% from last week</div>
          </div>
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
            <div className="text-slate-400 text-sm mb-2">Average Response Time</div>
            <div className="text-3xl font-bold text-white">2.4h</div>
            <div className="text-green-400 text-sm mt-2">↓ 0.5h from last week</div>
          </div>
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
            <div className="text-slate-400 text-sm mb-2">Meetings Scheduled</div>
            <div className="text-3xl font-bold text-white">8</div>
            <div className="text-slate-500 text-sm mt-2">Same as last week</div>
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="text-[#c9a84c] mb-2 text-xl font-medium">Detailed charts coming soon</div>
            <div className="text-slate-500 text-sm">More deep insights will be available once enough data is collected.</div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
