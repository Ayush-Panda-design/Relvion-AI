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
        <h1 className="text-3xl font-bold text-red-900 mb-6">Settings</h1>
        <div className="bg-[#FFF176] border border-[#FBC02D] rounded-2xl p-6 space-y-8 shadow-xl">
          
          <div>
            <h2 className="text-xl font-semibold text-red-800 mb-4 border-b border-[#FBC02D] pb-2">
              Profile
            </h2>
            <div className="flex items-center gap-4 p-4 bg-[#FFEE58] rounded-xl border border-[#FBC02D]">
              <div className="w-16 h-16 rounded-full bg-[#FFF9C4] border border-[#D32F2F] flex items-center justify-center text-2xl font-bold text-[#D32F2F] uppercase">
                {profile?.email ? profile.email.charAt(0) : 'U'}
              </div>
              <div>
                <div className="font-semibold text-lg text-white">
                  {profile?.email ? profile.email.split('@')[0] : 'Loading...'}
                </div>
                <div className="text-green-900">{profile?.email || 'user@example.com'}</div>
                {profile && (
                  <div className="text-xs text-green-800 mt-1">
                    {profile.messagesTotal.toLocaleString()} messages • {profile.threadsTotal.toLocaleString()} threads
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-red-800 mb-4 border-b border-[#FBC02D] pb-2">
              Account Configuration
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#FFEE58] rounded-xl border border-[#FBC02D]">
                <div>
                  <div className="font-medium text-white">Gmail Integration</div>
                  <div className="text-sm text-green-900">Manage your connected Gmail account via Corsair</div>
                </div>
                <button
                  onClick={() => handleManage('Gmail')}
                  className="px-4 py-2 bg-[#FFF9C4] border border-[#FBC02D] hover:border-[#D32F2F] hover:text-[#D32F2F] text-white rounded-lg text-sm transition-all"
                >
                  Manage
                </button>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#FFEE58] rounded-xl border border-[#FBC02D]">
                <div>
                  <div className="font-medium text-white">Google Calendar</div>
                  <div className="text-sm text-green-900">Manage your connected Calendar via Corsair</div>
                </div>
                <button
                  onClick={() => handleManage('Google Calendar')}
                  className="px-4 py-2 bg-[#FFF9C4] border border-[#FBC02D] hover:border-[#D32F2F] hover:text-[#D32F2F] text-white rounded-lg text-sm transition-all"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-red-800 mb-4 border-b border-[#FBC02D] pb-2">
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#FFEE58] rounded-xl border border-[#FBC02D]">
                <div>
                  <div className="font-medium text-white">Theme</div>
                  <div className="text-sm text-green-900">Current theme: {theme}</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] font-semibold rounded-lg text-sm transition-all"
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
