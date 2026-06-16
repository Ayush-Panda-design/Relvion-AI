'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { isTypingTarget, isTrashKey, eventKey } from '@/lib/keyboard';

export type EmailShortcutHandlers = {
  archive: () => void;
  trash: () => void;
  star: () => void;
  reply: () => void;
  close: () => void;
};

const G_FOLDERS: Record<string, string> = {
  i: 'inbox',
  c: 'calendar',
  s: 'sent',
  d: 'drafts',
  t: 'trash',
};

type UseKeyboardShortcutsOptions = {
  enabled?: boolean;
  onCompose: () => void;
  onFolderChange?: (folder: string) => void;
  onFocusSearch?: () => void;
  onNavigateSettings?: () => void;
  onNavigateAnalytics?: () => void;
  onShowShortcuts?: () => void;
  emailShortcutsRef?: MutableRefObject<EmailShortcutHandlers | null>;
};

export function useKeyboardShortcuts({
  enabled = true,
  onCompose,
  onFolderChange,
  onFocusSearch,
  onNavigateSettings,
  onNavigateAnalytics,
  onShowShortcuts,
  emailShortcutsRef,
}: UseKeyboardShortcutsOptions) {
  const pendingG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onComposeRef = useRef(onCompose);
  const onFolderChangeRef = useRef(onFolderChange);
  const onFocusSearchRef = useRef(onFocusSearch);
  const onNavigateSettingsRef = useRef(onNavigateSettings);
  const onNavigateAnalyticsRef = useRef(onNavigateAnalytics);
  const onShowShortcutsRef = useRef(onShowShortcuts);

  onComposeRef.current = onCompose;
  onFolderChangeRef.current = onFolderChange;
  onFocusSearchRef.current = onFocusSearch;
  onNavigateSettingsRef.current = onNavigateSettings;
  onNavigateAnalyticsRef.current = onNavigateAnalytics;
  onShowShortcutsRef.current = onShowShortcuts;

  useEffect(() => {
    if (!enabled) return;

    const clearG = () => {
      pendingG.current = false;
      if (gTimer.current) {
        clearTimeout(gTimer.current);
        gTimer.current = null;
      }
    };

    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const key = eventKey(e);

      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        return;
      }

      const email = emailShortcutsRef?.current;

      if (e.key === 'Escape' && email) {
        e.preventDefault();
        email.close();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        e.preventDefault();
        onFocusSearchRef.current?.();
        return;
      }

      if (e.key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        onShowShortcutsRef.current?.();
        return;
      }

      if (pendingG.current) {
        e.preventDefault();
        clearG();
        if (!key) return;
        const folder = G_FOLDERS[key];
        if (folder) {
          onFolderChangeRef.current?.(folder);
          return;
        }
        if (key === 'e') {
          onNavigateSettingsRef.current?.();
        } else if (key === 'a') {
          onNavigateAnalyticsRef.current?.();
        }
        return;
      }

      if (key === 'g') {
        e.preventDefault();
        pendingG.current = true;
        gTimer.current = setTimeout(clearG, 1200);
        return;
      }

      if (key === 'c') {
        e.preventDefault();
        onComposeRef.current();
        return;
      }

      if (!email) return;

      if (key === 'e') {
        e.preventDefault();
        email.archive();
        return;
      }

      if (isTrashKey(e)) {
        e.preventDefault();
        email.trash();
        return;
      }

      if (key === 's') {
        e.preventDefault();
        email.star();
        return;
      }

      if (key === 'r') {
        e.preventDefault();
        email.reply();
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => {
      window.removeEventListener('keydown', handler, true);
      clearG();
    };
  }, [enabled, emailShortcutsRef]);
}
