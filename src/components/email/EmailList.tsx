'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Star,
  Archive,
  Trash2,
  RefreshCw,
  MailOpen,
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

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
  IMPORTANT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  FYI: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
};

function EmailListSkeleton() {
  return (
    <div className={cn('h-full space-y-0.5 px-2 py-2', dash.bg)}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className={cn('flex items-center gap-3 rounded-xl px-4 py-3', 'bg-[#F7F7F5]/80 dark:bg-[#292a2d]/50')}
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#E9E9E7] dark:bg-[#3c4043]/50" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/4 animate-pulse rounded bg-[#E9E9E7] dark:bg-[#3c4043]/50" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-[#F1F1EF] dark:bg-[#3c4043]/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

  useEffect(() => {
    setSelectedEmail(null);
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

  const runAction = (e: React.MouseEvent, id: string, action: string, label: string) => {
    e.stopPropagation();
    fetch('/api/gmail/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    }).then(() => {
      toast.success(label);
      if (action !== 'star') fetchEmails({ silent: true });
    });
  };

  const cycleDensity = () => {
    const order: typeof density[] = ['default', 'comfortable', 'compact'];
    const next = order[(order.indexOf(density) + 1) % order.length];
    setDensity(next);
  };

  if (loading && emails.length === 0) {
    return <EmailListSkeleton />;
  }

  return (
    <div className={cn('relative flex h-full', dash.bg)}>
      <ContentProgress active={refreshing} />

      <div
        className={cn(
          'flex flex-col overflow-hidden transition-[width] duration-200',
          selectedEmail ? 'w-[42%] min-w-[300px]' : 'w-full'
        )}
      >
        {/* Toolbar */}
        <div className={cn('flex shrink-0 items-center gap-3 px-4 py-2.5', dash.glassToolbar)}>
          <div className="flex gap-0.5 rounded-lg border border-[#E9E9E7] bg-[#F7F7F5] p-0.5 dark:border-[#3c4043] dark:bg-[#303134]">
            {(['ALL', 'URGENT', 'IMPORTANT'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  filter === f
                    ? 'bg-white text-[#37352F] shadow-sm dark:bg-[#3c4043] dark:text-[#e8eaed] dark:shadow-none'
                    : cn(dash.textMuted, dash.hover)
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={cycleDensity}
              title={`Density: ${density}`}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs capitalize transition-colors',
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
              onClick={() => fetchEmails({ silent: emails.length > 0 })}
              className={cn('rounded-full p-2 transition-colors', dash.hover, dash.textMuted)}
              title="Refresh"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Email rows */}
        <div className={cn('flex-1 overflow-y-auto', refreshing && emails.length > 0 && 'opacity-95')}>
          {displayEmails.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <MailOpen size={40} className={dash.textMuted} strokeWidth={1.25} />
              <p className={cn('text-sm', dash.textMuted)}>No emails in {folder}</p>
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
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(isSelected ? null : email)}
                  className={cn(
                    'group relative flex cursor-pointer items-center transition-colors duration-150',
                    d.rowPy,
                    d.rowPx,
                    d.gap,
                    isSelected ? dash.rowActive : dash.hover,
                    'border-b',
                    dash.border
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'flex shrink-0 items-center justify-center rounded-full font-medium uppercase',
                      d.avatar,
                      dash.avatar
                    )}
                  >
                    {from.charAt(0)}
                  </div>

                  {/* Content */}
                  {d.singleLine ? (
                    <div className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden pr-24">
                      <span
                        className={cn(
                          'shrink-0 truncate',
                          isUnread ? dash.rowUnread : dash.rowRead,
                          'text-sm',
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
                        {snippet && (
                          <span className="font-normal"> — {snippet}</span>
                        )}
                      </span>
                      {isTriaging && (
                        <span className={cn('shrink-0 text-[10px]', dash.accent)}>Analyzing…</span>
                      )}
                      {email.priority && email.priority !== 'FYI' && !isTriaging && (
                        <span
                          className={cn(
                            'shrink-0 rounded border px-1 py-0.5 text-[10px] font-medium',
                            PRIORITY_COLORS[email.priority]
                          )}
                        >
                          {email.priority}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1 pr-24">
                      <div className="flex items-center gap-2">
                        <span className={cn('truncate text-sm', isUnread ? dash.rowUnread : dash.rowRead)}>
                          {from}
                        </span>
                        {isTriaging && (
                          <span className={cn('text-[10px]', dash.accent)}>Analyzing…</span>
                        )}
                      </div>
                      <div
                        className={cn(
                          'truncate text-sm',
                          isUnread ? dash.rowUnread : dash.textMuted
                        )}
                      >
                        {subject}
                        {(email as { messageCount?: number }).messageCount &&
                          (email as { messageCount?: number }).messageCount! > 1 && (
                            <span className={cn('ml-1 font-normal', dash.accent)}>
                              ({(email as { messageCount?: number }).messageCount})
                            </span>
                          )}
                      </div>
                      {d.showSnippet && snippet && (
                        <div className={cn('mt-0.5 truncate text-sm', dash.textSubtle)}>{snippet}</div>
                      )}
                    </div>
                  )}

                  {/* Date — hides on hover */}
                  <span
                    className={cn(
                      'absolute right-4 text-xs tabular-nums transition-opacity duration-150',
                      dash.textSubtle,
                      'group-hover:opacity-0'
                    )}
                  >
                    {dateStr}
                  </span>

                  {/* Hover actions — Gmail style */}
                  <div
                    className={cn(
                      'absolute right-3 flex items-center gap-0.5 rounded-full px-1 py-0.5',
                      'opacity-0 transition-all duration-150 group-hover:opacity-100',
                      'bg-[#f6f8fc]/90 dark:bg-[#303134]/95'
                    )}
                  >
                    {[
                      { action: 'archive', icon: Archive, label: 'Archived' },
                      { action: 'trash', icon: Trash2, label: 'Trashed' },
                      { action: 'star', icon: Star, label: 'Starred' },
                    ].map(({ action, icon: Icon, label }) => (
                      <button
                        key={action}
                        type="button"
                        onClick={(e) => runAction(e, email.id, action, label)}
                        className={cn(
                          'rounded-full p-2 transition-colors',
                          dash.textMuted,
                          cn(dash.hover, dash.text)
                        )}
                        title={label}
                      >
                        <Icon size={16} strokeWidth={1.75} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedEmail && (
          <motion.div
            key={selectedEmail.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18 }}
            className={cn('flex flex-1 flex-col overflow-hidden border-l', dash.border)}
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
