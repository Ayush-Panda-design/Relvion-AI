'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  RefreshCw,
  Webhook,
  User,
  Mail,
  Calendar,
  Keyboard,
  LayoutList,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { dash, type Density } from '@/components/dashboard/theme';
import { useDensity } from '@/components/dashboard/DensityProvider';
import { useTheme, DASHBOARD_THEMES } from '@/components/dashboard/ThemeProvider';
import { PageEnter } from '@/components/dashboard/loading/PageEnter';

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

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border',
        dash.elevated,
        dash.border
      )}
    >
      <div className={cn('border-b px-6 py-4', dash.border)}>
        <div className="flex items-start gap-3">
          <div className={cn('rounded-xl p-2.5', dash.iconWell)}>
            <Icon size={20} className={dash.accent} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className={cn('text-base font-semibold', dash.text)}>{title}</h2>
            {description && (
              <p className={cn('mt-0.5 text-sm', dash.textMuted)}>{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        ok
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-amber-500/10 text-amber-400'
      )}
    >
      {ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {label}
    </span>
  );
}

const SHORTCUTS = [
  { keys: ['c'], action: 'Compose new email' },
  { keys: ['/'], action: 'Focus search' },
  { keys: ['g', 'i'], action: 'Go to Inbox' },
  { keys: ['g', 's'], action: 'Go to Sent' },
  { keys: ['g', 'c'], action: 'Go to Calendar' },
  { keys: ['g', 'e'], action: 'Go to Settings' },
  { keys: ['⌘', 'K'], action: 'Command palette (Ctrl+K on Windows)' },
  { keys: ['e'], action: 'Archive (when viewing email)' },
  { keys: ['#'], action: 'Trash (when viewing email)' },
  { keys: ['r'], action: 'Reply (when viewing email)' },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<{
    email: string;
    messagesTotal: number;
    threadsTotal: number;
  } | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [webhookResult, setWebhookResult] = useState<WebhookResult | null>(null);
  const [registering, setRegistering] = useState(false);
  const { density, setDensity } = useDensity();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetch('/api/gmail/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.email) setProfile(data);
      })
      .catch(() => {});

    fetch('/api/webhooks/register')
      .then((r) => r.json())
      .then(setWebhookConfig)
      .catch(() => {});
  }, []);

  const registerWebhooks = async () => {
    setRegistering(true);
    setWebhookResult(null);
    try {
      const res = await fetch('/api/webhooks/register', { method: 'POST' });
      const data = await res.json();
      if (data.error && !data.gmail) throw new Error(data.error);
      setWebhookResult(data);
      if (data.gmail?.ok && data.calendar?.ok) {
        toast.success('Live sync enabled for Gmail & Calendar');
      } else {
        toast.error('Some webhooks failed — check status below');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const displayName = profile?.email?.split('@')[0] || 'User';

  return (
    <PageEnter className="min-h-0 flex-1">
      <div className={cn('mx-auto min-h-0 flex-1 overflow-y-auto px-6 py-8 max-w-3xl', dash.bg)}>
        <header className="mb-8">
          <h1 className={cn('text-2xl font-normal tracking-tight', dash.text)}>Settings</h1>
          <p className={cn('mt-1 text-sm', dash.textMuted)}>
            Manage your account, sync preferences, and workspace appearance.
          </p>
        </header>

        <div className="space-y-5">
          {/* Account */}
          <SettingsCard
            icon={User}
            title="Google account"
            description="Your connected Gmail and Calendar identity"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className={cn(
                  'flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-medium uppercase',
                  dash.avatar
                )}
              >
                {displayName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('text-lg font-medium', dash.text)}>{displayName}</p>
                <p className={cn('truncate text-sm', dash.textMuted)}>{profile?.email || 'Loading…'}</p>
                {profile && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs', dash.chip)}>
                      {profile.messagesTotal.toLocaleString()} messages
                    </span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs', dash.chip)}>
                      {profile.threadsTotal.toLocaleString()} threads
                    </span>
                  </div>
                )}
              </div>
              <form action="/api/auth/signout" method="POST" className="shrink-0">
                <button
                  type="submit"
                  className={cn(
                    'rounded-full border px-5 py-2 text-sm font-medium transition-colors',
                    dash.border,
                    dash.text,
                    dash.hover
                  )}
                >
                  Sign out
                </button>
              </form>
            </div>
          </SettingsCard>

          {/* Live sync */}
          <SettingsCard
            icon={Webhook}
            title="Live sync"
            description="Get new emails and calendar updates without refreshing"
          >
            <p className={cn('mb-4 text-sm leading-relaxed', dash.textMuted)}>
              Relvion uses Google push notifications to update your inbox in real time. For local
              development, expose your app with a public URL (e.g. ngrok) and set{' '}
              <code className={cn('rounded px-1.5 py-0.5 text-xs', dash.code)}>
                WEBHOOK_BASE_URL
              </code>{' '}
              in your environment. Watches expire after ~7 days — re-enable below when needed.
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              <StatusBadge
                ok={!!webhookConfig?.configured}
                label={webhookConfig?.configured ? 'URL configured' : 'URL not set'}
              />
              {webhookResult && (
                <>
                  <StatusBadge ok={webhookResult.gmail.ok} label="Gmail push" />
                  <StatusBadge ok={webhookResult.calendar.ok} label="Calendar watch" />
                </>
              )}
            </div>

            {webhookConfig?.baseUrl && (
              <div
                className={cn(
                  'mb-4 space-y-1.5 rounded-xl border p-3 text-xs',
                  dash.border,
                  dash.surface
                )}
              >
                <div className="flex items-center gap-2">
                  <Mail size={12} className={dash.accent} />
                  <span className={cn('truncate font-mono', dash.textSubtle)}>
                    {webhookConfig.endpoints.gmail || 'Gmail endpoint pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className={dash.accent} />
                  <span className={cn('truncate font-mono', dash.textSubtle)}>
                    {webhookConfig.endpoints.calendar || 'Calendar endpoint pending'}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={registerWebhooks}
              disabled={registering || !webhookConfig?.configured}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50',
                dash.compose
              )}
            >
              {registering ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Webhook size={16} />
              )}
              {registering ? 'Enabling…' : 'Enable live sync'}
            </button>

            {webhookResult && (
              <div className={cn('mt-4 space-y-1 text-xs', dash.textSubtle)}>
                {webhookResult.gmail.expiresAt && (
                  <p>Gmail expires {new Date(webhookResult.gmail.expiresAt).toLocaleDateString()}</p>
                )}
                {webhookResult.calendar.expiresAt && (
                  <p>
                    Calendar expires {new Date(webhookResult.calendar.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </SettingsCard>

          {/* Appearance */}
          <SettingsCard
            icon={Palette}
            title="Dashboard theme"
            description="Four polished workspaces inspired by premium SaaS dashboards"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DASHBOARD_THEMES.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      toast.success(`${t.name} theme applied`);
                    }}
                    className={cn(
                      'flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                      active
                        ? cn('ring-2 ring-[var(--dash-accent)]', dash.filterActive)
                        : cn(dash.border, dash.hover)
                    )}
                  >
                    <div className="flex w-full gap-1">
                      {t.swatches.map((c) => (
                        <span
                          key={c}
                          className="h-8 flex-1 rounded-lg ring-1 ring-black/6"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div>
                      <p className={cn('text-sm font-semibold', dash.text)}>{t.name}</p>
                      <p className={cn('text-xs', dash.textSubtle)}>{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </SettingsCard>

          {/* Inbox density */}
          <SettingsCard
            icon={LayoutList}
            title="Inbox density"
            description="How much space each email row uses"
          >
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'default', 'comfortable'] as Density[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDensity(d);
                    toast.success(`Density set to ${d}`);
                  }}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-sm capitalize transition-all',
                    density === d
                      ? cn(dash.filterActive, 'border-[var(--dash-accent)]')
                      : cn(dash.border, dash.textMuted, dash.hover)
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </SettingsCard>

          {/* Keyboard shortcuts */}
          <SettingsCard
            icon={Keyboard}
            title="Keyboard shortcuts"
            description="Work faster without reaching for the mouse"
          >
            <ul className="space-y-2">
              {SHORTCUTS.map(({ keys, action }) => (
                <li
                  key={action}
                  className="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5"
                >
                  <span className={cn('text-sm', dash.text)}>{action}</span>
                  <div className="flex shrink-0 gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className={cn(
                          'rounded border px-1.5 py-0.5 text-[10px] font-medium',
                          dash.border,
                          dash.textSubtle
                        )}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </SettingsCard>

          {/* Privacy */}
          <SettingsCard
            icon={Shield}
            title="Privacy & data"
            description="How Relvion handles your information"
          >
            <ul className={cn('space-y-3 text-sm leading-relaxed', dash.textMuted)}>
              <li>
                Emails are processed through your connected Google account. Relvion does not sell
                your data.
              </li>
              <li>
                AI triage and search use local embeddings stored in your Postgres database when
                configured.
              </li>
              <li>
                Agent chat history is stored only in your browser unless you clear it.
              </li>
            </ul>
            <Link
              href="/dashboard"
              className={cn('mt-4 inline-flex items-center gap-1.5 text-sm font-medium', dash.accent, 'hover:underline')}
            >
              Back to inbox
              <ExternalLink size={14} />
            </Link>
          </SettingsCard>
        </div>
      </div>
    </PageEnter>
  );
}
