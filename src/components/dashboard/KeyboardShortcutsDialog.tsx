'use client';

import { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

const SHORTCUT_GROUPS = [
  {
    title: 'Navigation',
    items: [
      { keys: ['⌘', 'K'], label: 'Command palette' },
      { keys: ['/'], label: 'Open command palette' },
      { keys: ['?'], label: 'This cheat sheet' },
      { keys: ['G', 'I'], label: 'Go to inbox' },
      { keys: ['G', 'C'], label: 'Go to calendar' },
      { keys: ['G', 'S'], label: 'Go to sent' },
      { keys: ['G', 'T'], label: 'Go to trash' },
      { keys: ['G', 'E'], label: 'Go to settings' },
      { keys: ['G', 'A'], label: 'Go to analytics' },
    ],
  },
  {
    title: 'Compose & search',
    items: [
      { keys: ['C'], label: 'Compose email' },
      { keys: ['/'], label: 'Focus search (when search focused)' },
    ],
  },
  {
    title: 'Email actions (detail open)',
    items: [
      { keys: ['E'], label: 'Archive' },
      { keys: ['#'], label: 'Trash' },
      { keys: ['S'], label: 'Star' },
      { keys: ['R'], label: 'Reply' },
      { keys: ['Esc'], label: 'Close detail' },
    ],
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-[1.5rem] items-center justify-center rounded border px-1.5 py-0.5 font-mono text-[10px]',
        dash.border,
        dash.chip
      )}
    >
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl',
              dash.elevated,
              dash.border
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn('flex items-center justify-between border-b px-5 py-4', dash.border)}>
              <div className="flex items-center gap-2">
                <Keyboard size={18} className={dash.accent} />
                <h2 className={cn('text-base font-semibold', dash.text)}>Keyboard shortcuts</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn('rounded-full p-2', dash.hover, dash.textMuted)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-6 overflow-y-auto p-5">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className={cn('mb-2 text-xs font-semibold uppercase tracking-wider', dash.textSubtle)}>
                    {group.title}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.label} className="flex items-center justify-between gap-4">
                        <span className={cn('text-sm', dash.textMuted)}>{item.label}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          {item.keys.map((k) => (
                            <Kbd key={k}>{k}</Kbd>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
