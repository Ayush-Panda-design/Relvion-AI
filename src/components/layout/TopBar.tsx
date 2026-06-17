'use client';

import { useState, useEffect, useRef, type RefObject } from 'react';
import { Search, Bell, Settings, Zap, X, Database, Mail, Menu, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { openCommandPalette } from '@/lib/command-palette-events';
import { ThemePicker } from '@/components/dashboard/ThemePicker';
import { DashboardIllustration } from '@/components/illustrations/DashboardIllustration';
import { GMAIL_SEARCH_HINTS } from '@/lib/gmail-search-parser';

interface SearchResult {
  id: string;
  type?: 'email' | 'event';
  subject: string;
  body_preview: string;
  sender: string;
  similarity: number;
  startDateTime?: string;
}

type SearchSource =
  | 'corsair-db'
  | 'corsair-db+calendar'
  | 'gmail-api'
  | 'pgvector'
  | 'pgvector+corsair';

interface Notification {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export function TopBar({
  onSearch,
  searchInputRef,
  onMenuClick,
}: {
  onSearch?: (q: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onMenuClick?: () => void;
}) {
  const internalSearchRef = useRef<HTMLInputElement>(null);
  const inputRef = searchInputRef ?? internalSearchRef;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [events, setEvents] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);
  const [source, setSource] = useState<SearchSource>('corsair-db');
  const [activeOperators, setActiveOperators] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setEvents([]);
      setActiveOperators([]);
      setShowResults(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search/vector?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setEvents(data.events || []);
      setSource(data.source || 'corsair-db');
      setActiveOperators(data.operators || []);
      setShowResults(true);
      onSearch?.(q);
    } catch {
      setResults([]);
      setEvents([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setEvents([]);
      setActiveOperators([]);
      setShowResults(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        if (active !== inputRef.current) return;
        return;
      }
      e.preventDefault();
      openCommandPalette();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inputRef]);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening) fetchNotifications();
  };

  const timeAgo = (dateStr: string) => {
    try {
      const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h`;
      return `${Math.floor(diffHrs / 24)}d`;
    } catch {
      return '';
    }
  };

  return (
    <header
      className={cn(
        'relative z-40 grid h-[56px] shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 sm:gap-3 sm:px-4',
        dash.glassToolbar
      )}
    >
      <div className="flex w-10 shrink-0 items-center lg:w-12">
        <button
          type="button"
          onClick={onMenuClick}
          className={cn('rounded-full p-2.5 lg:hidden', dash.hover, dash.textMuted)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="relative min-w-0 px-0 sm:px-2">
        <div
          className={cn(
            'relative mx-auto flex h-10 w-full max-w-xl items-center rounded-full transition-all duration-200 sm:h-11',
            dash.search,
            focused && dash.searchFocus
          )}
        >
          <Search
            size={18}
            className={cn('ml-3.5 shrink-0 sm:ml-4', searching ? cn('animate-pulse', dash.accent) : dash.textMuted)}
            strokeWidth={1.75}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search mail"
            className={cn(
              'min-w-0 flex-1 bg-transparent py-2.5 pl-2.5 pr-9 text-sm focus:outline-none sm:pl-3 sm:pr-16',
              dash.text,
              'placeholder:text-[var(--dash-text-subtle)]'
            )}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setFocused(true);
              setShowHints(!query.trim());
              if (results.length > 0 || events.length > 0) setShowResults(true);
            }}
            onBlur={() => {
              setFocused(false);
              setTimeout(() => {
                setShowResults(false);
                setShowHints(false);
              }, 200);
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              className={cn('absolute right-9 rounded-full p-1 transition-colors sm:right-11', dash.hover, dash.textMuted)}
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => openCommandPalette()}
            className={cn(
              'absolute right-2.5 hidden rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors md:inline-block',
              cn(dash.border, dash.textMuted, dash.hover)
            )}
            title="Open command palette"
          >
            /
          </button>
        </div>

        <AnimatePresence>
          {showHints && focused && !query && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={cn(
                'absolute top-full left-0 right-0 z-[200] mt-2 overflow-hidden rounded-2xl border shadow-2xl',
                dash.elevated,
                dash.border
              )}
            >
              <div className={cn('border-b px-4 py-2.5 text-xs font-medium', dash.border, dash.textSubtle)}>
                Gmail advanced search (Corsair DB)
              </div>
              <div className="max-h-[280px] overflow-y-auto p-2">
                {GMAIL_SEARCH_HINTS.map((hint) => (
                  <button
                    key={hint.op}
                    type="button"
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors',
                      dash.hover
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setQuery(hint.example);
                      setShowHints(false);
                    }}
                  >
                    <span className={cn('font-mono text-xs', dash.accent)}>{hint.example}</span>
                    <span className={cn('text-xs', dash.textMuted)}>{hint.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResults && query && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full left-0 right-0 z-[200] mt-2 overflow-hidden rounded-2xl border shadow-2xl',
                dash.elevated,
                dash.border,
                'dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
              )}
            >
              {results.length > 0 || events.length > 0 ? (
                <>
                  <div
                    className={cn(
                      'flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 text-xs',
                      dash.border,
                      dash.textSubtle
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {source === 'pgvector' || source === 'pgvector+corsair' ? (
                        <>
                          <Zap size={12} className={dash.accent} /> Semantic
                        </>
                      ) : source === 'gmail-api' ? (
                        <>
                          <Mail size={12} /> Gmail API
                        </>
                      ) : (
                        <>
                          <Database size={12} className={dash.accent} /> Corsair Search
                        </>
                      )}
                      {(source === 'corsair-db+calendar' || events.length > 0) && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> + events
                        </span>
                      )}
                    </div>
                    <span>
                      {results.length} mail{events.length > 0 ? ` · ${events.length} events` : ''}
                    </span>
                  </div>
                  {activeOperators.length > 0 && (
                    <div className={cn('flex flex-wrap gap-1.5 border-b px-4 py-2', dash.border)}>
                      {activeOperators.map((op) => (
                        <span
                          key={op}
                          className={cn('rounded-full px-2 py-0.5 font-mono text-[10px]', dash.accentSoftBg)}
                        >
                          {op}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="max-h-[400px] overflow-y-auto">
                    {results.map((r) => (
                      <div
                        key={`mail-${r.id}`}
                        className={cn('cursor-pointer px-4 py-3 transition-colors', dash.hover)}
                      >
                        <div className="flex items-center gap-2">
                          <Mail size={14} className={cn('shrink-0', dash.accent)} />
                          <div className={cn('min-w-0 flex-1 truncate text-sm font-medium', dash.text)}>
                            {r.subject}
                          </div>
                          {r.similarity < 1 && r.similarity > 0.6 && (
                            <span className={cn('flex shrink-0 items-center gap-0.5 text-[10px]', dash.accent)}>
                              <Sparkles size={10} />
                              {Math.round(r.similarity * 100)}%
                            </span>
                          )}
                        </div>
                        <div className={cn('mt-0.5 truncate pl-5 text-xs', dash.textMuted)}>
                          {r.sender} — {r.body_preview}
                        </div>
                      </div>
                    ))}
                    {events.length > 0 && (
                      <>
                        <div className={cn('px-4 py-2 text-[10px] font-semibold uppercase tracking-wide', dash.textSubtle)}>
                          Calendar
                        </div>
                        {events.map((e) => (
                          <div
                            key={`event-${e.id}`}
                            className={cn('cursor-pointer px-4 py-3 transition-colors', dash.hover)}
                          >
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="shrink-0 text-emerald-500" />
                              <div className={cn('min-w-0 flex-1 truncate text-sm font-medium', dash.text)}>
                                {e.subject}
                              </div>
                            </div>
                            <div className={cn('mt-0.5 truncate pl-5 text-xs', dash.textMuted)}>
                              {e.startDateTime
                                ? new Date(e.startDateTime).toLocaleString()
                                : e.body_preview}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </>
              ) : !searching ? (
                <div className="px-4 py-6">
                  <DashboardIllustration variant="search" size="sm" />
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <ThemePicker compact />
        <div className="relative z-40" ref={notifRef}>
          <button
            type="button"
            onClick={handleBellClick}
            className={cn('relative rounded-full p-2 transition-colors', dash.hover, dash.textMuted)}
          >
            <Bell size={20} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className={cn('absolute right-1 top-1 h-2 w-2 rounded-full', dash.accentBg)} />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className={cn(
                  'absolute right-0 top-full z-[200] mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border shadow-2xl sm:w-80',
                  dash.elevated,
                  dash.border,
                  'dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
                )}
              >
                <div className={cn('border-b px-4 py-3', dash.border)}>
                  <span className={cn('text-sm font-medium', dash.text)}>Notifications</span>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {loadingNotifs ? (
                    <div className={cn('py-10 text-center text-sm', dash.textMuted)}>Loading…</div>
                  ) : notifications.length === 0 ? (
                    <div className={cn('py-10 text-center text-sm', dash.textMuted)}>All caught up</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={cn('cursor-pointer px-4 py-3', dash.hover)}>
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <div className={cn('truncate text-xs font-medium', dash.accent)}>{n.from}</div>
                            <div className={cn('truncate text-sm', dash.text)}>{n.subject}</div>
                          </div>
                          <span className={cn('shrink-0 text-[10px]', dash.textSubtle)}>{timeAgo(n.date)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href="/settings"
          className={cn('rounded-full p-2 transition-colors', dash.hover, dash.textMuted)}
        >
          <Settings size={20} strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
