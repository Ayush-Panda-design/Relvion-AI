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
        <button className="text-green-900 hover:text-red-800 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#388E3C] ring-2 ring-[#FFF9C4]" />
        </button>
        <Link href="/settings" className="text-green-900 hover:text-red-800 transition-colors">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
