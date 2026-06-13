'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Zap, X, Database } from 'lucide-react';
import Link from 'next/link';

interface SearchResult { 
  id: string; 
  subject: string; 
  body_preview: string; 
  sender: string; 
  similarity: number; 
}

export function TopBar({ onSearch }: { onSearch?: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [source, setSource] = useState<'pgvector' | 'gmail-db' | 'mock'>('pgvector');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <header className="h-[60px] border-b border-[#1e293b] flex items-center justify-between px-6 bg-[#0a0f1e] shrink-0 relative">
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className={searching ? 'text-[#c9a84c] animate-pulse' : 'text-slate-500'} />
        </div>
        <input
          type="text"
          placeholder="Search emails locally (⚡ instant)… or ⌘K for commands"
          className="block w-full pl-9 pr-10 py-2 border border-[#1e293b] rounded-full bg-[#111827] text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] focus:border-[#c9a84c] transition-all"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setShowResults(false); }} className="absolute inset-y-0 right-10 flex items-center pr-1 text-slate-500 hover:text-slate-300">
            <X size={14} />
          </button>
        )}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block border border-[#1e293b] rounded px-1.5 py-0.5 text-xs text-slate-500 bg-[#0a0f1e]">⌘K</kbd>
        </div>

        {/* Search results dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-[#1e293b] rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-[#1e293b] flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                {source === 'pgvector' ? (
                  <><Zap size={12} className="text-[#c9a84c]" /> Local vector search</>
                ) : (
                  <><Database size={12} className="text-blue-400" /> Gmail DB fallback search</>
                )}
              </div>
              <div>{results.length} results</div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {results.map(r => (
                <div key={r.id} className="px-4 py-3 hover:bg-[#1a2235] cursor-pointer border-b border-[#1e293b] last:border-b-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{r.subject}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{r.sender} — {r.body_preview}</div>
                  {source === 'pgvector' && (
                    <div className="text-xs text-[#c9a84c] mt-0.5">{Math.round((r.similarity || 0) * 100)}% match</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {showResults && results.length === 0 && query && !searching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-[#1e293b] rounded-xl shadow-2xl z-50 px-4 py-3 text-sm text-slate-500">
            No matching emails found.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button className="text-slate-400 hover:text-slate-200 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-[#0a0f1e]" />
        </button>
        <Link href="/settings" className="text-slate-400 hover:text-slate-200 transition-colors">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
