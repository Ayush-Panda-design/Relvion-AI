'use client';
import { AppShell } from '@/components/layout/AppShell';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 space-y-6">
          
          <div>
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Account Configuration</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#1a2235] rounded-xl">
                <div>
                  <div className="font-medium text-white">Gmail Integration</div>
                  <div className="text-sm text-slate-400">Manage your connected Gmail account via Corsair</div>
                </div>
                <button className="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3b55] text-white rounded-lg text-sm transition-colors">Manage</button>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#1a2235] rounded-xl">
                <div>
                  <div className="font-medium text-white">Google Calendar</div>
                  <div className="text-sm text-slate-400">Manage your connected Calendar via Corsair</div>
                </div>
                <button className="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3b55] text-white rounded-lg text-sm transition-colors">Manage</button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#1a2235] rounded-xl">
                <div>
                  <div className="font-medium text-white">Theme</div>
                  <div className="text-sm text-slate-400">Dark mode is currently active</div>
                </div>
                <div className="text-[#c9a84c] font-medium text-sm">Dark</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
