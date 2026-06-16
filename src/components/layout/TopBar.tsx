'use client';

import { useState, useEffect, useRef, type RefObject } from 'react';
import { Search, Bell, Settings, Zap, X, Database, Mail, Menu } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

interface SearchResult {
  id: string;
  subject: string;
  body_preview: string;
  sender: string;
  similarity: number;
}

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
}: {
  onSearch?: (q: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}) {
  const internalSearchRef = useRef<HTMLInputElement>(null);
  const inputRef = searchInputRef ?? internalSearchRef;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);
  const [source, setSource] = useState<'pgvector' | 'gmail-api' | 'gmail-db' | 'mock'>('pgvector');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search/vector?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setSource(data.source || 'pgvector');
      setShowResults(true);
      onSearch?.(q);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
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
        'relative flex h-[64px] shrink-0 items-center gap-3 px-4',
        dash.bg,
        'border-b',
        dash.border
      )}
    >
      {/* Spacer balances right icons — keeps search centered */}
      <div className="flex w-[88px] shrink-0 items-center">
        <button
          type="button"
          className={cn('rounded-full p-2.5 lg:hidden', dash.hover, dash.textMuted)}
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Elevated pill search — Gmail style */}
      <div className="relative mx-auto w-full max-w-[720px] flex-1">
        <div
          className={cn(
            'relative flex h-12 items-center rounded-full transition-all duration-200',
            dash.search,
            focused && dash.searchFocus
          )}
        >
          <Search
            size={20}
            className={cn('ml-4 shrink-0', searching ? 'animate-pulse text-[#8ab4f8]' : dash.textMuted)}
            strokeWidth={1.75}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search mail"
            className={cn(
              'w-full bg-transparent py-3 pl-3 pr-20 text-sm focus:outline-none',
              dash.text,
              'placeholder:text-[#5f6368] dark:placeholder:text-[#9aa0a6]'
            )}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (results.length > 0) setShowResults(true);
            }}
            onBlur={() => {
              setFocused(false);
              setTimeout(() => setShowResults(false), 200);
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
              className={cn('absolute right-11 rounded-full p-1.5 transition-colors', dash.hover, dash.textMuted)}
            >
              <X size={16} />
            </button>
          )}
          <kbd
            className={cn(
              'absolute right-3 hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline-block',
              'border-[#dadce0] text-[#5f6368] dark:border-[#5f6368] dark:text-[#9aa0a6]'
            )}
          >
            /
          </kbd>
        </div>

        <AnimatePresence>
          {showResults && query && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border shadow-2xl',
                dash.elevated,
                dash.border,
                'dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
              )}
            >
              {results.length > 0 ? (
                <>
                  <div
                    className={cn(
                      'flex items-center justify-between border-b px-4 py-2.5 text-xs',
                      dash.border,
                      dash.textSubtle
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {source === 'pgvector' ? (
                        <>
                          <Zap size={12} className="text-[#8ab4f8]" /> Vector search
                        </>
                      ) : source === 'gmail-api' ? (
                        <>
                          <Mail size={12} /> Gmail
                        </>
                      ) : (
                        <>
                          <Database size={12} /> DB fallback
                        </>
                      )}
                    </div>
                    <span>{results.length} results</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {results.map((r) => (
                      <div
                        key={r.id}
                        className={cn('cursor-pointer px-4 py-3 transition-colors', dash.hover)}
                      >
                        <div className={cn('truncate text-sm font-medium', dash.text)}>{r.subject}</div>
                        <div className={cn('mt-0.5 truncate text-xs', dash.textMuted)}>
                          {r.sender} — {r.body_preview}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : !searching ? (
                <div className={cn('px-4 py-8 text-center text-sm', dash.textMuted)}>No results</div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right actions */}
      <div className="flex w-[88px] shrink-0 items-center justify-end gap-0.5">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={handleBellClick}
            className={cn('relative rounded-full p-2.5 transition-colors', dash.hover, dash.textMuted)}
          >
            <Bell size={20} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#8ab4f8]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className={cn(
                  'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border shadow-2xl',
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
                            <div className="truncate text-xs font-medium text-[#8ab4f8]">{n.from}</div>
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
          className={cn('rounded-full p-2.5 transition-colors', dash.hover, dash.textMuted)}
        >
          <Settings size={20} strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
