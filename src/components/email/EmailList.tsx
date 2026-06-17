'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import {
  Star,
  Archive,
  Trash2,
  RefreshCw,
  AlignJustify,
  Rows3,
  LayoutList,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { EmailDetail } from './EmailDetail';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { groupEmailsByThread } from '@/lib/groupThreads';
import { dash, densityTokens } from '@/components/dashboard/theme';
import { useDensity } from '@/components/dashboard/DensityProvider';
import { ContentProgress } from '@/components/ui/ContentProgress';
import { useFolderEmails } from '@/hooks/useFolderEmails';
import type { EmailShortcutHandlers } from '@/hooks/useKeyboardShortcuts';
import { DashboardIllustration, folderToIllustration } from '@/components/illustrations/DashboardIllustration';
import { EmailListLoader } from '@/components/dashboard/loading/DashboardLoaders';
import { GlassEmailRow } from '@/components/ui/glass-email-row';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import { Badge, priorityToBadgeVariant } from '@/components/ui/badge';

export function EmailList({
  folder,
  onRegisterRefresh,
  onRegisterEmailShortcuts,
}: {
  folder: string;
  onRegisterRefresh?: (fn: () => void) => void;
  onRegisterEmailShortcuts?: (handlers: EmailShortcutHandlers | null) => void;
}) {
  const { emails, loading, refreshing, triaging, fetchEmails } = useFolderEmails(folder);
  const { density, setDensity } = useDensity();
  const d = densityTokens[density];
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'IMPORTANT'>('ALL');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setSelectedEmail(null);
    setSelectedIds(new Set());
    setFilter('ALL');
  }, [folder]);

  const fetchRef = useRef(fetchEmails);
  fetchRef.current = fetchEmails;

  useEffect(() => {
    onRegisterRefresh?.(() => fetchRef.current({ silent: true }));
  }, [onRegisterRefresh]);

  useEffect(() => {
    onRegisterEmailShortcuts?.(null);
  }, [folder, onRegisterEmailShortcuts]);

  useEffect(() => {
    return () => onRegisterEmailShortcuts?.(null);
  }, [onRegisterEmailShortcuts]);

  const filtered = filter === 'ALL' ? emails : emails.filter((e) => e.priority === filter);
  const displayEmails =
    folder === 'inbox' || folder === 'sent' ? groupEmailsByThread(filtered) : filtered;

  const cycleDensity = () => {
    const order = ['default', 'comfortable', 'compact'] as const;
    const next = order[(order.indexOf(density) + 1) % order.length];
    setDensity(next);
  };

  const runAction = (e: React.MouseEvent, id: string, action: string, label: string) => {
    e.stopPropagation();
    toast.success(label);
    startTransition(() => {
      fetch('/api/gmail/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      }).then(() => {
        if (action !== 'star') fetchEmails({ silent: true });
      });
    });
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(displayEmails.map((e) => e.id)));
  };

  const runBulkAction = async (action: 'archive' | 'trash' | 'markRead' | 'star') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/gmail/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk action failed');
      const ok = data.results?.filter((r: { ok: boolean }) => r.ok).length ?? ids.length;
      const labels: Record<string, string> = {
        archive: 'archived',
        trash: 'trashed',
        markRead: 'marked read',
        star: 'starred',
      };
      toast.success(`${ok} email${ok === 1 ? '' : 's'} ${labels[action]}`);
      setSelectedIds(new Set());
      if (action !== 'star') fetchEmails({ silent: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const selectEmail = (email: (typeof displayEmails)[0]) => {
    setSelectedEmail((prev: typeof email | null) => (prev?.id === email.id ? null : email));
  };

  if (loading && emails.length === 0) {
    return <EmailListLoader />;
  }

  return (
    <div className={cn('relative flex min-h-0 flex-1', dash.bg)}>
      <ContentProgress active={refreshing} />

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-hidden transition-[width] duration-150 ease-out',
          selectedEmail ? 'hidden w-full md:flex md:w-[42%] md:min-w-[300px]' : 'w-full'
        )}
      >
        <div className={cn('flex shrink-0 flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4', dash.glassToolbar)}>
          {selectedIds.size > 0 ? (
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <span className={cn('text-sm font-medium', dash.text)}>
                {selectedIds.size} selected
              </span>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => runBulkAction('archive')}
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium', dash.hover, dash.textMuted)}
              >
                Archive
              </button>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => runBulkAction('trash')}
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium', dash.hover, dash.textMuted)}
              >
                Trash
              </button>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => runBulkAction('markRead')}
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium', dash.hover, dash.textMuted)}
              >
                Mark read
              </button>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => runBulkAction('star')}
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium', dash.hover, dash.textMuted)}
              >
                Star
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className={cn('ml-auto text-xs', dash.textSubtle, dash.hover)}
              >
                Clear
              </button>
            </div>
          ) : (
            <>
          <input
            type="checkbox"
            title="Select all"
            checked={displayEmails.length > 0 && selectedIds.size === displayEmails.length}
            onChange={() =>
              selectedIds.size === displayEmails.length ? setSelectedIds(new Set()) : selectAllVisible()
            }
            className="rounded border-gray-400"
          />
          <div className={cn('flex gap-0.5', dash.filterBar)}>
            {(['ALL', 'URGENT', 'IMPORTANT'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-100',
                  filter === f ? dash.filterActive : cn(dash.textMuted, dash.hover)
                )}
              >
                {f === 'ALL' ? (
                  'All'
                ) : (
                  <Badge variant={priorityToBadgeVariant(f)} className="border-0 bg-transparent px-0 py-0 text-inherit">
                    {f}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={cycleDensity}
              title={`Density: ${density}`}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs capitalize transition-colors duration-100',
                dash.hover,
                dash.textMuted
              )}
            >
              {density === 'compact' ? (
                <AlignJustify size={14} />
              ) : density === 'comfortable' ? (
                <Rows3 size={14} />
              ) : (
                <LayoutList size={14} />
              )}
              {density}
            </button>
            <span className={cn('hidden text-xs sm:inline', dash.textSubtle)}>
              {refreshing ? 'Syncing…' : `${displayEmails.length}`}
            </span>
            <button
              type="button"
              title="Refresh inbox"
              onClick={() => fetchEmails({ silent: emails.length > 0 })}
              className={cn('rounded-full p-2 transition-colors duration-100', dash.hover, dash.textMuted)}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
            </>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {displayEmails.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10">
              <DashboardIllustration
                variant={filter !== 'ALL' ? 'search' : folderToIllustration(folder)}
                size="md"
                title={filter !== 'ALL' ? `No ${filter.toLowerCase()} emails` : undefined}
                subtitle={
                  filter !== 'ALL' ? 'Try switching back to All or check again later.' : undefined
                }
              />
            </div>
          ) : (
            displayEmails.map((email) => {
              const isTriaging = triaging.has(email.id);
              const isSelected = selectedEmail?.id === email.id;
              const isUnread = email.data?.unread !== false;
              const from = email.data?.from || 'Unknown';
              const subject = email.data?.subject || '(no subject)';
              const snippet = email.data?.body || '';
              const dateStr = email.data?.date
                ? new Date(email.data.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : '';

              return (
                <GlassEmailRow
                  key={email.id}
                  isSelected={isSelected}
                  onClick={() => selectEmail(email)}
                >
                  <div className={cn('relative flex items-center', d.rowPy, d.rowPx, d.gap)}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(email.id)}
                      onClick={(e) => toggleSelect(e, email.id)}
                      onChange={() => {}}
                      className="shrink-0 rounded border-gray-400"
                    />
                    <ContactAvatar name={from} sizeClass={d.avatar} />

                    {d.singleLine ? (
                      <div className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden pr-24">
                        <span
                          className={cn(
                            'shrink-0 truncate text-sm',
                            isUnread ? dash.rowUnread : dash.rowRead,
                            density === 'compact' ? 'max-w-[120px]' : 'max-w-[160px]'
                          )}
                        >
                          {from}
                        </span>
                        <span className={cn('min-w-0 truncate text-sm', dash.textMuted)}>
                          <span className={isUnread ? cn('font-medium', dash.rowUnread) : ''}>
                            {subject}
                          </span>
                          {(email as { messageCount?: number }).messageCount &&
                            (email as { messageCount?: number }).messageCount! > 1 && (
                              <span className={cn('ml-1 font-normal', dash.accent)}>
                                ({(email as { messageCount?: number }).messageCount})
                              </span>
                            )}
                          {snippet && <span className="font-normal"> — {snippet}</span>}
                        </span>
                        {isTriaging && (
                          <Badge variant="accent" className="shrink-0">
                            Analyzing
                          </Badge>
                        )}
                        {email.priority && email.priority !== 'FYI' && !isTriaging && (
                          <Badge variant={priorityToBadgeVariant(email.priority)} className="shrink-0">
                            {email.priority}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1 pr-24">
                        <div className="flex items-center gap-2">
                          <span className={cn('truncate text-sm', isUnread ? dash.rowUnread : dash.rowRead)}>
                            {from}
                          </span>
                          {isTriaging && <Badge variant="accent">Analyzing</Badge>}
                          {email.priority && email.priority !== 'FYI' && !isTriaging && (
                            <Badge variant={priorityToBadgeVariant(email.priority)}>{email.priority}</Badge>
                          )}
                        </div>
                        <div className={cn('truncate text-sm', isUnread ? dash.rowUnread : dash.textMuted)}>
                          {subject}
                        </div>
                        {d.showSnippet && snippet && (
                          <div className={cn('mt-0.5 truncate text-sm', dash.textSubtle)}>{snippet}</div>
                        )}
                      </div>
                    )}

                    <span
                      className={cn(
                        'absolute right-4 text-xs tabular-nums transition-opacity duration-100',
                        dash.textSubtle,
                        'group-hover:opacity-0'
                      )}
                    >
                      {dateStr}
                    </span>

                    <div
                      className={cn(
                        'absolute right-3 flex items-center gap-0.5 rounded-full border px-1 py-0.5',
                        'opacity-100 md:opacity-0 md:transition-opacity md:duration-100 md:group-hover:opacity-100',
                        'border-[var(--dash-border)] bg-[var(--dash-surface)]/95'
                      )}
                    >
                      {[
                        { action: 'archive', icon: Archive, label: 'Archive', toast: 'Archived' },
                        { action: 'trash', icon: Trash2, label: 'Trash', toast: 'Trashed' },
                        { action: 'star', icon: Star, label: 'Star', toast: 'Starred' },
                      ].map(({ action, icon: Icon, label, toast: toastLabel }) => (
                        <button
                          key={action}
                          type="button"
                          title={label}
                          onClick={(e) => runAction(e, email.id, action, toastLabel)}
                          className={cn(
                            'rounded-full p-2 transition-colors duration-100',
                            dash.textMuted,
                            dash.hover,
                            dash.text
                          )}
                        >
                          <Icon size={16} strokeWidth={1.75} />
                        </button>
                      ))}
                    </div>
                  </div>
                </GlassEmailRow>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {selectedEmail && (
          <motion.div
            key={selectedEmail.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={cn(
              'fixed inset-0 z-50 flex min-h-0 flex-col overflow-hidden md:relative md:inset-auto md:z-auto md:flex-1 md:border-l',
              dash.bg,
              dash.border
            )}
          >
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
              onRefresh={() => fetchEmails({ silent: true })}
              onRegisterShortcuts={onRegisterEmailShortcuts}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
