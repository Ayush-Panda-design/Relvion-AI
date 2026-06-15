'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Zap, X, Database, Mail } from 'lucide-react';
import Link from 'next/link';

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

export function TopBar({ onSearch }: { onSearch?: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [source, setSource] = useState<'pgvector' | 'gmail-api' | 'gmail-db' | 'mock'>('pgvector');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Notification state
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
    } catch { 
      setResults([]); 
    } finally { 
      setSearching(false); 
    }
  };

  // Debounce input to prevent spamming the API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }
    
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Load notifications
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

  // Close notification panel when clicking outside
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

  // Format relative time
  const timeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <header className="h-[60px] border-b border-[#FBC02D] flex items-center justify-between px-6 bg-[#FFF9C4] shrink-0 relative">
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className={searching ? 'text-[#D32F2F] animate-pulse' : 'text-green-800'} />
        </div>
        <input
          type="text"
          placeholder="Search emails locally (⚡ instant)… or ⌘K for commands"
          className="block w-full pl-9 pr-10 py-2 border border-[#FBC02D] rounded-full bg-[#FFF176] text-sm text-red-800 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#D32F2F] focus:border-[#D32F2F] transition-all"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setShowResults(false); }} className="absolute inset-y-0 right-10 flex items-center pr-1 text-green-800 hover:text-red-700">
            <X size={14} />
          </button>
        )}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block border border-[#FBC02D] rounded px-1.5 py-0.5 text-xs text-green-800 bg-[#FFF9C4]">⌘K</kbd>
        </div>

        {/* Search results dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFF176] border border-[#FBC02D] rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-[#FBC02D] flex items-center justify-between text-xs text-green-800">
              <div className="flex items-center gap-1">
                {source === 'pgvector' ? (
                  <><Zap size={12} className="text-[#D32F2F]" /> Local vector search</>
                ) : source === 'gmail-api' ? (
                  <><Mail size={12} className="text-blue-600" /> Gmail search</>
                ) : (
                  <><Database size={12} className="text-blue-400" /> Gmail DB fallback search</>
                )}
              </div>
              <div>{results.length} results</div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {results.map(r => (
                <div key={r.id} className="px-4 py-3 hover:bg-[#FFEE58] cursor-pointer border-b border-[#FBC02D] last:border-b-0">
                  <div className="text-sm font-medium text-red-800 truncate">{r.subject}</div>
                  <div className="text-xs text-green-800 truncate mt-0.5">{r.sender} — {r.body_preview}</div>
                  {source === 'pgvector' && (
                    <div className="text-xs text-[#D32F2F] mt-0.5">{Math.round((r.similarity || 0) * 100)}% match</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {showResults && results.length === 0 && query && !searching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFF176] border border-[#FBC02D] rounded-xl shadow-2xl z-50 px-4 py-3 text-sm text-green-800">
            No matching emails found.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="text-green-900 hover:text-red-800 transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] rounded-full bg-[#D32F2F] text-[10px] text-white font-bold px-1 ring-2 ring-[#FFF9C4]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {unreadCount === 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#388E3C] ring-2 ring-[#FFF9C4]" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#FFF176] border border-[#FBC02D] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#FBC02D] flex items-center justify-between">
                <span className="text-sm font-semibold text-red-800">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-[#D32F2F] font-medium">{unreadCount} unread</span>
                )}
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {loadingNotifs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 border-2 border-[#D32F2F] border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-green-800">Loading…</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-sm text-green-800">
                    <Bell size={24} className="mx-auto mb-2 opacity-40" />
                    You&apos;re all caught up!
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="px-4 py-3 hover:bg-[#FFEE58] cursor-pointer border-b border-[#FBC02D]/50 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-[#D32F2F] truncate">{n.from}</div>
                          <div className="text-sm font-medium text-red-800 truncate mt-0.5">{n.subject}</div>
                          <div className="text-xs text-green-800 truncate mt-0.5">{n.snippet}</div>
                        </div>
                        <span className="text-[10px] text-green-700 whitespace-nowrap mt-0.5">{timeAgo(n.date)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-[#FBC02D] text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#D32F2F] hover:text-red-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <Link href="/settings" className="text-green-900 hover:text-red-800 transition-colors">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
