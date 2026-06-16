'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Mail,
  Calendar,
  Settings,
  Archive,
  Trash2,
  Star,
  BarChart2,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

interface Action {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number }>;
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((o) => !o);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const actions: Action[] = [
    {
      id: 'inbox',
      title: 'Go to Inbox',
      subtitle: 'View your inbox',
      icon: Mail,
      type: 'Navigation',
      shortcut: 'g i',
      action: () => {
        onFolderChange?.('inbox');
        setOpen(false);
      },
    },
    {
      id: 'compose',
      title: 'Compose Email',
      subtitle: 'Write a new email',
      icon: Send,
      type: 'Action',
      shortcut: 'c',
      action: () => {
        onComposeClick?.();
        setOpen(false);
      },
    },
    {
      id: 'drafts',
      title: 'Go to Drafts',
      icon: Mail,
      type: 'Navigation',
      action: () => {
        onFolderChange?.('drafts');
        setOpen(false);
      },
    },
    {
      id: 'sent',
      title: 'Go to Sent',
      icon: Mail,
      type: 'Navigation',
      shortcut: 'g s',
      action: () => {
        onFolderChange?.('sent');
        setOpen(false);
      },
    },
    {
      id: 'calendar',
      title: 'Go to Calendar',
      subtitle: 'View and manage events',
      icon: Calendar,
      type: 'Navigation',
      shortcut: 'g c',
      action: () => {
        onFolderChange?.('calendar');
        setOpen(false);
      },
    },
    {
      id: 'analytics',
      title: 'Go to Analytics',
      icon: BarChart2,
      type: 'Navigation',
      shortcut: 'g a',
      action: () => {
        onFolderChange?.('analytics');
        setOpen(false);
      },
    },
    {
      id: 'settings',
      title: 'Go to Settings',
      icon: Settings,
      type: 'Navigation',
      shortcut: 'g e',
      action: () => {
        onFolderChange?.('settings');
        setOpen(false);
      },
    },
    {
      id: 'starred',
      title: 'Go to Starred',
      icon: Star,
      type: 'Navigation',
      action: () => {
        onFolderChange?.('starred');
        setOpen(false);
      },
    },
    {
      id: 'trash',
      title: 'Go to Trash',
      icon: Trash2,
      type: 'Navigation',
      shortcut: 'g t',
      action: () => {
        onFolderChange?.('trash');
        setOpen(false);
      },
    },
    {
      id: 'spam',
      title: 'Go to Spam',
      icon: Archive,
      type: 'Navigation',
      action: () => {
        onFolderChange?.('spam');
        setOpen(false);
      },
    },
  ];

  const filtered = query.trim()
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    }
    if (e.key === 'Enter' && filtered[selected]) {
      filtered[selected].action();
    }
  };

  if (!open) return null;

  const typeColors: Record<string, string> = {
    Navigation: 'text-[#8ab4f8] bg-[#8ab4f8]/10',
    Action: 'text-[#8ab4f8] bg-[#8ab4f8]/15',
  };

  const kbdClass = cn(
    'rounded border px-1.5 py-0.5 font-mono text-[10px]',
    dash.border,
    dash.textSubtle,
    'bg-[#f1f3f4] dark:bg-[#303134]'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[10vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className={cn(
          'flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl',
          dash.elevated,
          dash.border,
          'dark:shadow-[0_8px_32px_rgba(0,0,0,0.55)]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn('flex items-center border-b px-4 py-3', dash.border)}>
          <Search size={18} className={cn('mr-3 shrink-0', dash.accent)} strokeWidth={1.75} />
          <input
            ref={inputRef}
            className={cn(
              'flex-1 bg-transparent text-base focus:outline-none',
              dash.text,
              'placeholder:text-[#5f6368] dark:placeholder:text-[#9aa0a6]'
            )}
            placeholder="Search commands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className={kbdClass}>esc</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className={cn('py-10 text-center text-sm', dash.textMuted)}>No matching commands</div>
          ) : (
            filtered.map((action, i) => {
              const Icon = action.icon;
              const isSelected = selected === i;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.action}
                  onMouseEnter={() => setSelected(i)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                    isSelected ? dash.rowActive : dash.hover
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg p-1.5',
                      isSelected ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]' : cn(dash.avatar, 'bg-[#8ab4f8]/10')
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn('text-sm font-medium', dash.text)}>{action.title}</div>
                    {action.subtitle && (
                      <div className={cn('text-xs', dash.textMuted)}>{action.subtitle}</div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {action.shortcut && <kbd className={kbdClass}>{action.shortcut}</kbd>}
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        typeColors[action.type] || cn(dash.textMuted, 'bg-[#3c4043]/50')
                      )}
                    >
                      {action.type}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div
          className={cn(
            'flex items-center gap-4 border-t px-4 py-2.5 text-xs',
            dash.border,
            dash.textSubtle
          )}
        >
          <span>
            <kbd className={kbdClass}>↑↓</kbd> Navigate
          </span>
          <span>
            <kbd className={kbdClass}>↵</kbd> Select
          </span>
          <span>
            <kbd className={kbdClass}>esc</kbd> Close
          </span>
          <span className="ml-auto">
            <kbd className={kbdClass}>⌘K</kbd> Toggle
          </span>
        </div>
      </div>
    </div>
  );
}
