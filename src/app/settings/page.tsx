'use client';
import { AppShell } from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Webhook } from 'lucide-react';

interface WebhookConfig {
  baseUrl: string | null;
  configured: boolean;
  endpoints: {
    gmail: string | null;
    calendar: string | null;
    corsair: string | null;
  };
}

interface WebhookResult {
  gmail: { ok: boolean; expiresAt?: string; error?: string };
  calendar: { ok: boolean; expiresAt?: string; channelId?: string; error?: string };
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<{
    email: string;
    messagesTotal: number;
    threadsTotal: number;
  } | null>(null);

  const [theme, setTheme] = useState<'Dark' | 'Light'>('Dark');
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [webhookResult, setWebhookResult] = useState<WebhookResult | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetch('/api/gmail/profile')
      .then(r => r.json())
      .then(data => {
        if (data.email) setProfile(data);
      })
      .catch(() => {});

    fetch('/api/webhooks/register')
      .then(r => r.json())
      .then(setWebhookConfig)
      .catch(() => {});

    const saved = localStorage.getItem('relvion-theme');
    if (saved === 'Light') setTheme('Light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'Dark' ? 'Light' : 'Dark';
    setTheme(next);
    localStorage.setItem('relvion-theme', next);
    toast.success(`Theme switched to ${next} mode`);
  };

  const registerWebhooks = async () => {
    setRegistering(true);
    setWebhookResult(null);
    try {
      const res = await fetch('/api/webhooks/register', { method: 'POST' });
      const data = await res.json();
      if (data.error && !data.gmail) {
        throw new Error(data.error);
      }
      setWebhookResult(data);
      if (data.gmail?.ok && data.calendar?.ok) {
        toast.success('Gmail and Calendar webhooks registered');
      } else {
        toast.error('Webhook registration partially failed — see details below');
      }
    } catch (err: any) {
      toast.error(err.message || 'Webhook registration failed');
    } finally {
      setRegistering(false);
    }
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
              <div className="flex-1">
                <div className="font-semibold text-lg text-red-900">
                  {profile?.email ? profile.email.split('@')[0] : 'Loading...'}
                </div>
                <div className="text-green-900">{profile?.email || 'Authenticating...'}</div>
                {profile && (
                  <div className="text-xs text-green-800 mt-1">
                    {profile.messagesTotal.toLocaleString()} messages •{' '}
                    {profile.threadsTotal.toLocaleString()} threads
                  </div>
                )}
              </div>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-red-900 border border-red-200 font-semibold rounded-lg text-sm transition-all shadow-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-red-800 mb-4 border-b border-[#FBC02D] pb-2">
              Realtime Webhooks
            </h2>
            <div className="p-4 bg-[#FFEE58] rounded-xl border border-[#FBC02D] space-y-4">
              <div className="text-sm text-green-900">
                Register Gmail push notifications and Calendar watches for live inbox updates.
                Requires a public URL (ngrok in dev). Watches expire after ~7 days — re-register weekly.
              </div>

              {webhookConfig && (
                <div className="text-xs text-green-800 space-y-1 font-mono">
                  <div>Base URL: {webhookConfig.baseUrl || 'Not configured'}</div>
                  <div>Status: {webhookConfig.configured ? 'Ready' : 'Set WEBHOOK_BASE_URL in .env'}</div>
                  {webhookConfig.endpoints.gmail && (
                    <div>Gmail: {webhookConfig.endpoints.gmail}</div>
                  )}
                  {webhookConfig.endpoints.calendar && (
                    <div>Calendar: {webhookConfig.endpoints.calendar}</div>
                  )}
                </div>
              )}

              <button
                onClick={registerWebhooks}
                disabled={registering}
                className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] font-semibold rounded-lg text-sm transition-all disabled:opacity-50"
              >
                {registering ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Webhook size={14} />
                )}
                {registering ? 'Registering…' : 'Register Webhooks'}
              </button>

              {webhookResult && (
                <div className="text-xs space-y-2">
                  <div className={webhookResult.gmail.ok ? 'text-green-800' : 'text-red-700'}>
                    Gmail: {webhookResult.gmail.ok ? 'OK' : webhookResult.gmail.error}
                    {webhookResult.gmail.expiresAt && ` — expires ${new Date(webhookResult.gmail.expiresAt).toLocaleString()}`}
                  </div>
                  <div className={webhookResult.calendar.ok ? 'text-green-800' : 'text-red-700'}>
                    Calendar: {webhookResult.calendar.ok ? 'OK' : webhookResult.calendar.error}
                    {webhookResult.calendar.expiresAt && ` — expires ${new Date(webhookResult.calendar.expiresAt).toLocaleString()}`}
                  </div>
                </div>
              )}
            </div>
          </div>



          <div>
            <h2 className="text-xl font-semibold text-red-800 mb-4 border-b border-[#FBC02D] pb-2">
              Preferences
            </h2>
            <div className="flex justify-between items-center p-4 bg-[#FFEE58] rounded-xl border border-[#FBC02D]">
              <div>
                <div className="font-medium text-red-900">Theme</div>
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
    </AppShell>
  );
}
