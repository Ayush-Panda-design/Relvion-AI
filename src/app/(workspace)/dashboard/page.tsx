'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { EmailList } from '@/components/email/EmailList';
import { CalendarView } from '@/components/calendar/CalendarView';
import { DashboardIllustration } from '@/components/illustrations/DashboardIllustration';
import { PageLoader } from '@/components/dashboard/loading/DashboardLoaders';
import { PageEnter } from '@/components/dashboard/loading/PageEnter';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { prefetchFolderEmails } from '@/hooks/useFolderEmails';
import { prefetchCalendarEvents } from '@/hooks/useCalendarEvents';
import { runWhenIdle } from '@/lib/client-cache';
import { subscribeAppEvents } from '@/lib/app-events';
import { emailShortcutsRef } from '@/lib/email-shortcuts-ref';
import { useWorkspaceNav } from '@/contexts/workspace-nav';

function DashboardContent() {
  const { activeFolder } = useWorkspaceNav();
  const [needsGoogle, setNeedsGoogle] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const refreshHandlers = useRef<{ email?: () => void; calendar?: () => void }>({});

  useEffect(() => {
    fetch('/api/gmail/profile')
      .then((res) => res.json())
      .then((data) => {
        if (!data.email || data.error) setNeedsGoogle(true);
      })
      .catch(() => setNeedsGoogle(true))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    runWhenIdle(() => {
      prefetchFolderEmails('inbox');
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
          <p className={cn('mb-8 text-sm', dash.textMuted)}>
            Relvion needs access to your Gmail and Calendar to power your workspace.
          </p>
          <a
            href="/api/auth/google/start"
            className={cn(
              'flex w-full items-center justify-center gap-3 rounded-2xl border py-3.5 font-semibold shadow-md',
              dash.border,
              dash.surface,
              dash.text,
              dash.hover
            )}
          >
            Connect Google Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <PageEnter layoutKey={activeFolder} className="min-h-0 flex-1">
      {activeFolder === 'calendar' ? (
        <CalendarView onRegisterRefresh={registerCalendarRefresh} />
      ) : (
        <EmailList
          key={activeFolder}
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
