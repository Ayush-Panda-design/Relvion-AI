'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { EmailList } from '@/components/email/EmailList';
import { CalendarView } from '@/components/calendar/CalendarView';
import { DashboardIllustration } from '@/components/illustrations/DashboardIllustration';
import { PageLoader } from '@/components/dashboard/loading/DashboardLoaders';
import { PageEnter } from '@/components/dashboard/loading/PageEnter';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { prefetchFolderEmails, prefetchAllMailFolders } from '@/hooks/useFolderEmails';
import { prefetchCalendarEvents } from '@/hooks/useCalendarEvents';
import { runWhenIdle } from '@/lib/client-cache';
import { subscribeAppEvents } from '@/lib/app-events';
import { formatGmailConnectError } from '@/lib/gmail-connect-error';
import { emailShortcutsRef } from '@/lib/email-shortcuts-ref';
import { useWorkspaceNav } from '@/contexts/workspace-nav';

function DashboardContent() {
  const { activeFolder } = useWorkspaceNav();
  const [needsGoogle, setNeedsGoogle] = useState(false);
  const [connectReason, setConnectReason] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const refreshHandlers = useRef<{ email?: () => void; calendar?: () => void }>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/gmail/profile').then((res) => res.json()),
    ])
      .then(([me, profile]) => {
        if (me?.email) setSessionEmail(me.email);
        if (profile?.connected && profile?.email) {
          setNeedsGoogle(false);
          return;
        }
        setNeedsGoogle(true);
        setConnectReason(
          typeof profile?.reason === 'string'
            ? formatGmailConnectError(profile.reason)
            : 'Gmail access is missing or expired for this account.'
        );
      })
      .catch(() => {
        setNeedsGoogle(true);
        setConnectReason('Could not verify Gmail connection.');
      })
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    runWhenIdle(() => {
      prefetchAllMailFolders();
      prefetchCalendarEvents();
    });
  }, []);

  useEffect(() => {
    return subscribeAppEvents((type) => {
      if (type === 'EMAIL_RECEIVED' || type === 'EMAIL_UPDATED' || type === 'EMAIL_DELETED') {
        refreshHandlers.current.email?.();
      }
      if (type === 'CALENDAR_UPDATED') {
        refreshHandlers.current.calendar?.();
      }
    });
  }, []);

  useEffect(() => {
    if (activeFolder !== 'calendar') prefetchFolderEmails(activeFolder);
    else prefetchCalendarEvents();
  }, [activeFolder]);

  const registerEmailRefresh = useCallback((fn: () => void) => {
    refreshHandlers.current.email = fn;
  }, []);

  const registerCalendarRefresh = useCallback((fn: () => void) => {
    refreshHandlers.current.calendar = fn;
  }, []);

  if (!authChecked) {
    return <PageLoader label="Preparing your workspace…" />;
  }

  if (needsGoogle) {
    return (
      <div className={cn('relative flex min-h-0 flex-1 items-center justify-center overflow-hidden', dash.bg)}>
        <div
          className={cn(
            'relative z-10 w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl',
            dash.elevated,
            dash.border
          )}
        >
          <DashboardIllustration variant="connect" size="md" showText={false} className="mb-2" />
          <h2 className={cn('mb-2 text-2xl font-bold', dash.text)}>Connect Google</h2>
          <p className={cn('mb-3 text-sm', dash.textMuted)}>
            Relvion needs access to your Gmail and Calendar to power your workspace.
          </p>
          {sessionEmail && (
            <p className={cn('mb-3 text-xs', dash.textSubtle)}>
              Signed in as <span className={cn('font-medium', dash.text)}>{sessionEmail}</span>
            </p>
          )}
          {connectReason && (
            <p className={cn('mb-6 rounded-xl border px-3 py-2 text-left text-xs', dash.border, dash.surface, dash.textSubtle)}>
              {connectReason}
            </p>
          )}
          {!connectReason && <div className="mb-8" />}
          <a
            href="/api/auth/google/start?connect=true"
            className={cn(
              'flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 font-semibold shadow-md',
              dash.compose
            )}
          >
            Connect Google Account
          </a>
          <p className={cn('mt-4 text-xs leading-relaxed', dash.textSubtle)}>
            Complete the full Google consent screen (do not close the tab early). Calendar access is optional.
          </p>
          <form action="/api/auth/signout" method="POST" className="mt-4">
            <button
              type="submit"
              className={cn('w-full text-xs font-medium underline-offset-2 hover:underline', dash.textSubtle)}
            >
              Sign out and use a different account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <PageEnter className="min-h-0 flex-1">
      {activeFolder === 'calendar' ? (
        <CalendarView onRegisterRefresh={registerCalendarRefresh} />
      ) : (
        <EmailList
          folder={activeFolder}
          onRegisterRefresh={registerEmailRefresh}
          onRegisterEmailShortcuts={(handlers) => {
            emailShortcutsRef.current = handlers;
          }}
        />
      )}
    </PageEnter>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
