'use client';

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
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
import { DashboardIllustration } from '@/components/illustrations/DashboardIllustration';
import { dash } from '@/components/dashboard/theme';
import { Badge } from '@/components/ui/badge';
import { eventKey } from '@/lib/keyboard';
import { subscribeCommandPalette } from '@/lib/command-palette-events';

interface Action {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type: 'Navigation' | 'Action';
  shortcut?: string;
  keywords?: string;
  action: () => void;
}

interface CommandPaletteProps {
  onFolderChange?: (folder: string) => void;
  onComposeClick?: () => void;
}

export function CommandPalette({ onFolderChange, onComposeClick }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = eventKey(e);
      if (!key && e.key !== 'Escape') return;

      if (key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  useEffect(() => {
    return subscribeCommandPalette({
      onToggle: () => setOpen((o) => !o),
      onOpen: () => setOpen(true),
    });
  }, []);

  const close = () => setOpen(false);

  const actions: Action[] = [
    {
      id: 'inbox',
      title: 'Go to Inbox',
      subtitle: 'View your inbox',
      icon: Mail,
      type: 'Navigation',
      shortcut: 'g i',
      keywords: 'mail messages',
      action: () => {
        onFolderChange?.('inbox');
        close();
      },
    },
    {
      id: 'compose',
      title: 'Compose Email',
      subtitle: 'Write a new email',
      icon: Send,
      type: 'Action',
      shortcut: 'c',
      keywords: 'write new send',
      action: () => {
        onComposeClick?.();
        close();
      },
    },
    {
      id: 'drafts',
      title: 'Go to Drafts',
      icon: Mail,
      type: 'Navigation',
      action: () => {
        onFolderChange?.('drafts');
        close();
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
        close();
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
        close();
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
        close();
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
        close();
      },
    },
    {
      id: 'starred',
      title: 'Go to Starred',
      icon: Star,
      type: 'Navigation',
      action: () => {
        onFolderChange?.('starred');
        close();
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
        close();
      },
    },
    {
      id: 'spam',
      title: 'Go to Spam',
      icon: Archive,
      type: 'Navigation',
      action: () => {
        onFolderChange?.('spam');
        close();
      },
    },
  ];

  const kbdClass = cn(
    'rounded border px-1.5 py-0.5 font-mono text-[10px]',
    dash.border,
    dash.textSubtle,
    dash.chip
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[10vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={cn(
              'flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl',
              dash.elevated,
              dash.border,
              'dark:shadow-[0_8px_32px_rgba(0,0,0,0.55)]'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              label="Relvion command palette"
              className="flex flex-col"
              loop
            >
              <div className={cn('flex items-center border-b px-4 py-3', dash.border)}>
                <Search size={18} className={cn('mr-3 shrink-0', dash.accent)} strokeWidth={1.75} />
                <Command.Input
                  placeholder="Type a command or search…"
                  className={cn(
                    'flex-1 bg-transparent text-base focus:outline-none',
                    dash.text,
                    'placeholder:text-[#9B9A97] dark:placeholder:text-[#9aa0a6]'
                  )}
                />
                <kbd className={kbdClass}>esc</kbd>
              </div>

              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty>
                  <div className="py-6">
                    <DashboardIllustration
                      variant="search"
                      size="sm"
                      title="No matching commands"
                      subtitle="Try a different keyword."
                    />
                  </div>
                </Command.Empty>

                <Command.Group
                  heading="Quick actions"
                  className="[&_[cmdk-group-heading]]:mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[#7A7770] dark:[&_[cmdk-group-heading]]:text-[#9aa0a6]"
                >
                  {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Command.Item
                        key={action.id}
                        value={`${action.title} ${action.subtitle ?? ''} ${action.keywords ?? ''}`}
                        onSelect={action.action}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors outline-none',
                          dash.hover,
                          'data-[selected=true]:bg-[rgba(13,148,136,0.08)] data-[selected=true]:shadow-[inset_3px_0_0_0_#0D9488] dark:data-[selected=true]:bg-[#3c4043]/60 dark:data-[selected=true]:shadow-[inset_3px_0_0_0_#8ab4f8]'
                        )}
                      >
                        <div className={cn('rounded-lg p-1.5', dash.accentSoftBg)}>
                          <Icon size={16} className={dash.accent} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={cn('text-sm font-medium', dash.text)}>{action.title}</div>
                          {action.subtitle && (
                            <div className={cn('text-xs', dash.textMuted)}>{action.subtitle}</div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {action.shortcut && <kbd className={kbdClass}>{action.shortcut}</kbd>}
                          <Badge variant={action.type === 'Action' ? 'accent' : 'outline'}>
                            {action.type}
                          </Badge>
                        </div>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              </Command.List>

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
                  <kbd className={kbdClass}>/</kbd> Open
                </span>
                <span className="ml-auto">
                  <kbd className={kbdClass}>⌘K</kbd> Toggle
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
