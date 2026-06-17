'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  RefreshCw,
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
  Zap,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { dash, type Density } from '@/components/dashboard/theme';
import { useDensity } from '@/components/dashboard/DensityProvider';
import { useTheme, DASHBOARD_THEMES } from '@/components/dashboard/ThemeProvider';
import { PageEnter } from '@/components/dashboard/loading/PageEnter';
import { ContactAvatar } from '@/components/ui/ContactAvatar';

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

function SyncServiceRow({
  name,
  icon: Icon,
  connected,
  detail,
}: {
  name: string;
  icon: typeof Mail;
  connected: boolean;
  detail?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border px-4 py-3',
        dash.border,
        dash.surface
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn('rounded-lg p-2', dash.iconWell)}>
          <Icon size={16} className={dash.accent} />
        </div>
        <div className="min-w-0">
          <p className={cn('text-sm font-medium', dash.text)}>{name}</p>
          {detail && <p className={cn('truncate text-xs', dash.textSubtle)}>{detail}</p>}
        </div>
      </div>
      <StatusBadge
        ok={connected}
        label={connected ? 'Connected' : 'Not connected'}
      />
    </div>
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
  const { theme, appearance, setTheme, toggleAppearance } = useTheme();

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
        toast.success('Gmail and Calendar will now update automatically');
      } else if (data.gmail?.ok || data.calendar?.ok) {
        toast.error('Only part of your account connected — try again');
      } else {
        toast.error('Could not turn on updates — try again in a moment');
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
      <div className={cn('mx-auto min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 max-w-3xl', dash.bg)}>
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
              <ContactAvatar
                name={profile?.email || displayName}
                initials={displayName.charAt(0)}
                sizeClass="h-16 w-16 text-xl"
                variant="theme"
              />
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

          {/* Instant updates */}
          <SettingsCard
            icon={Zap}
            title="Instant updates"
            description="See new emails and calendar changes without refreshing"
          >
            <p className={cn('mb-5 text-sm leading-relaxed', dash.textMuted)}>
              When this is on, your inbox and calendar stay in sync with Google in the background.
              You&apos;ll see new mail and event changes as they happen.
            </p>

            <div className="mb-5 space-y-2">
              <SyncServiceRow
                name="Gmail"
                icon={Mail}
                connected={!!webhookResult?.gmail.ok}
                detail={
                  webhookResult?.gmail.expiresAt
                    ? `Active until ${new Date(webhookResult.gmail.expiresAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : webhookResult
                      ? undefined
                      : 'Turn on updates below to connect'
                }
              />
              <SyncServiceRow
                name="Google Calendar"
                icon={Calendar}
                connected={!!webhookResult?.calendar.ok}
                detail={
                  webhookResult?.calendar.expiresAt
                    ? `Active until ${new Date(webhookResult.calendar.expiresAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : webhookResult
                      ? undefined
                      : 'Turn on updates below to connect'
                }
              />
            </div>

            {!webhookConfig?.configured && (
              <div
                className={cn(
                  'mb-5 flex gap-3 rounded-xl border px-4 py-3 text-sm',
                  'border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-300'
                )}
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>
                  Instant updates aren&apos;t available on this workspace yet. If you&apos;re the
                  person who set up Relvion, check the advanced section below.
                </p>
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
                <Zap size={16} />
              )}
              {registering
                ? 'Connecting…'
                : webhookResult?.gmail.ok && webhookResult?.calendar.ok
                  ? 'Reconnect'
                  : 'Turn on instant updates'}
            </button>

            {webhookResult?.gmail.ok && webhookResult?.calendar.ok && webhookResult.gmail.expiresAt && (
              <p className={cn('mt-3 text-xs', dash.textSubtle)}>
                Tap reconnect before{' '}
                {new Date(webhookResult.gmail.expiresAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                to keep updates running smoothly.
              </p>
            )}

            {webhookConfig?.configured && (
              <details className={cn('mt-5 rounded-xl border', dash.border)}>
                <summary
                  className={cn(
                    'flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium',
                    dash.textMuted,
                    '[&::-webkit-details-marker]:hidden'
                  )}
                >
                  <span>Advanced (for developers)</span>
                  <ChevronDown size={16} className="opacity-60" />
                </summary>
                <div className={cn('space-y-3 border-t px-4 py-3 text-xs', dash.border, dash.textSubtle)}>
                  <p>
                    Requires a public app URL configured by your administrator. Connections refresh
                    automatically about once a week.
                  </p>
                  {webhookConfig.baseUrl && (
                    <div className={cn('space-y-1.5 rounded-lg border p-3', dash.border, dash.surface)}>
                      <p className={cn('font-medium', dash.text)}>Service endpoints</p>
                      <p className="truncate font-mono">{webhookConfig.endpoints.gmail || 'Gmail — pending'}</p>
                      <p className="truncate font-mono">{webhookConfig.endpoints.calendar || 'Calendar — pending'}</p>
                    </div>
                  )}
                </div>
              </details>
            )}
          </SettingsCard>

          {/* Appearance */}
          <SettingsCard
            icon={Palette}
            title="Dashboard theme"
            description="Six polished workspaces — each with light and dark appearance"
          >
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border p-3" style={{ borderColor: 'var(--dash-border)' }}>
              <div>
                <p className={cn('text-sm font-medium', dash.text)}>Appearance</p>
                <p className={cn('text-xs', dash.textSubtle)}>
                  {appearance === 'dark' ? 'Dark mode — easier on the eyes at night' : 'Light mode — crisp daytime workspace'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleAppearance();
                  toast.success(appearance === 'dark' ? 'Light mode on' : 'Dark mode on');
                }}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  dash.border,
                  dash.hover,
                  dash.text
                )}
              >
                {appearance === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {appearance === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
