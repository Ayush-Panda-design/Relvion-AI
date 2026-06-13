'use client';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [profile, setProfile] = useState<{
    email: string;
    messagesTotal: number;
    threadsTotal: number;
  } | null>(null);

  const [theme, setTheme] = useState<'Dark' | 'Light'>('Dark');

  useEffect(() => {
    fetch('/api/gmail/profile')
      .then(r => r.json())
      .then(data => {
        if (data.email) {
          setProfile(data);
        }
      })
      .catch(() => {});
      
    // Load theme from localStorage if available
    const saved = localStorage.getItem('relvion-theme');
    if (saved === 'Light') setTheme('Light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'Dark' ? 'Light' : 'Dark';
    setTheme(next);
    localStorage.setItem('relvion-theme', next);
    toast.success(`Theme switched to ${next} mode (mock)`);
  };

  const handleManage = (service: string) => {
    toast.success(`${service} is managed via Corsair Studio.`);
  };

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Settings</h1>
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 space-y-8 shadow-xl">
          
          <div>
            <h2 className="text-xl font-semibold text-slate-200 mb-4 border-b border-[#1e293b] pb-2">
              Profile
            </h2>
            <div className="flex items-center gap-4 p-4 bg-[#1a2235] rounded-xl border border-[#1e293b]">
              <div className="w-16 h-16 rounded-full bg-[#0a0f1e] border border-[#c9a84c] flex items-center justify-center text-2xl font-bold text-[#c9a84c] uppercase">
                {profile?.email ? profile.email.charAt(0) : 'U'}
              </div>
              <div>
                <div className="font-semibold text-lg text-white">
                  {profile?.email ? profile.email.split('@')[0] : 'Loading...'}
                </div>
                <div className="text-slate-400">{profile?.email || 'user@example.com'}</div>
                {profile && (
                  <div className="text-xs text-slate-500 mt-1">
                    {profile.messagesTotal.toLocaleString()} messages • {profile.threadsTotal.toLocaleString()} threads
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-200 mb-4 border-b border-[#1e293b] pb-2">
              Account Configuration
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#1a2235] rounded-xl border border-[#1e293b]">
                <div>
                  <div className="font-medium text-white">Gmail Integration</div>
                  <div className="text-sm text-slate-400">Manage your connected Gmail account via Corsair</div>
                </div>
                <button
                  onClick={() => handleManage('Gmail')}
                  className="px-4 py-2 bg-[#0a0f1e] border border-[#1e293b] hover:border-[#c9a84c] hover:text-[#c9a84c] text-white rounded-lg text-sm transition-all"
                >
                  Manage
                </button>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#1a2235] rounded-xl border border-[#1e293b]">
                <div>
                  <div className="font-medium text-white">Google Calendar</div>
                  <div className="text-sm text-slate-400">Manage your connected Calendar via Corsair</div>
                </div>
                <button
                  onClick={() => handleManage('Google Calendar')}
                  className="px-4 py-2 bg-[#0a0f1e] border border-[#1e293b] hover:border-[#c9a84c] hover:text-[#c9a84c] text-white rounded-lg text-sm transition-all"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-200 mb-4 border-b border-[#1e293b] pb-2">
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#1a2235] rounded-xl border border-[#1e293b]">
                <div>
                  <div className="font-medium text-white">Theme</div>
                  <div className="text-sm text-slate-400">Current theme: {theme}</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-[#c9a84c] hover:bg-[#d4b55c] text-[#0a0f1e] font-semibold rounded-lg text-sm transition-all"
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
