'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Mail, Calendar, Settings, Archive, Trash2, Star, BarChart2, RefreshCw, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Action {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  onFolderChange?: (folder: string) => void;
  onComposeClick?: () => void;
}

export function CommandPalette({ onFolderChange, onComposeClick }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const actions: Action[] = [
    { id: 'inbox', title: 'Go to Inbox', subtitle: 'View your inbox', icon: Mail, type: 'Navigation', shortcut: 'g i', action: () => { onFolderChange?.('inbox'); setOpen(false); } },
    { id: 'compose', title: 'Compose Email', subtitle: 'Write a new email', icon: Send, type: 'Action', shortcut: 'c', action: () => { onComposeClick?.(); setOpen(false); } },
    { id: 'drafts', title: 'Go to Drafts', icon: Mail, type: 'Navigation', action: () => { onFolderChange?.('drafts'); setOpen(false); } },
    { id: 'sent', title: 'Go to Sent', icon: Mail, type: 'Navigation', action: () => { onFolderChange?.('sent'); setOpen(false); } },
    { id: 'calendar', title: 'Go to Calendar', subtitle: 'View and manage events', icon: Calendar, type: 'Navigation', shortcut: 'g c', action: () => { onFolderChange?.('calendar'); setOpen(false); } },
    { id: 'analytics', title: 'Go to Analytics', icon: BarChart2, type: 'Navigation', action: () => { router.push('/analytics'); setOpen(false); } },
    { id: 'settings', title: 'Go to Settings', icon: Settings, type: 'Navigation', shortcut: 'g s', action: () => { router.push('/settings'); setOpen(false); } },
    { id: 'starred', title: 'Go to Starred', icon: Star, type: 'Navigation', action: () => { onFolderChange?.('starred'); setOpen(false); } },
    { id: 'trash', title: 'Go to Trash', icon: Trash2, type: 'Navigation', action: () => { onFolderChange?.('trash'); setOpen(false); } },
    { id: 'spam', title: 'Go to Spam', icon: Archive, type: 'Navigation', action: () => { onFolderChange?.('spam'); setOpen(false); } },
  ];

  const filtered = query.trim()
    ? actions.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  useEffect(() => { setSelected(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action(); }
  };

  if (!open) return null;

  const typeColors: Record<string, string> = {
    Navigation: 'text-blue-400 bg-blue-400/10',
    Action: 'text-[#D32F2F] bg-[#D32F2F]/10',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#FFF9C4]/80 backdrop-blur-sm flex justify-center items-start pt-[10vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#FFF176] border border-[#FBC02D] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center px-4 py-3 border-b border-[#FBC02D]">
          <Search size={18} className="text-green-800 mr-3 shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-red-900 placeholder-slate-500 text-base focus:outline-none"
            placeholder="Search commands…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="text-xs text-green-800 border border-[#FBC02D] rounded px-1.5 py-0.5 bg-[#FFF9C4]">esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="text-center text-green-800 text-sm py-8">No matching commands</div>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.id}
                onClick={action.action}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  selected === i ? 'bg-[#FFEE58]' : ''
                }`}
              >
                <div className={`p-1.5 rounded-lg ${selected === i ? 'bg-[#D32F2F]/20 text-[#D32F2F]' : 'bg-[#FBC02D] text-green-900'}`}>
                  <action.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-red-800">{action.title}</div>
                  {action.subtitle && <div className="text-xs text-green-800">{action.subtitle}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {action.shortcut && (
                    <span className="text-xs text-green-700 border border-[#FBC02D] rounded px-1.5 py-0.5 bg-[#FFF9C4]">
                      {action.shortcut}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[action.type] || 'text-green-800 bg-slate-500/10'}`}>
                    {action.type}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-[#FBC02D] flex items-center gap-4 text-xs text-green-700">
          <span><kbd className="border border-[#FBC02D] rounded px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="border border-[#FBC02D] rounded px-1">↵</kbd> Select</span>
          <span><kbd className="border border-[#FBC02D] rounded px-1">esc</kbd> Close</span>
          <span className="ml-auto"><kbd className="border border-[#FBC02D] rounded px-1">⌘K</kbd> Toggle</span>
        </div>
      </div>
    </div>
  );
}
