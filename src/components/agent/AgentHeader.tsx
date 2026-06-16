'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Share2, MoreHorizontal, ChevronDown, Plus, Trash2, Copy, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

export type AgentStatus = 'idle' | 'thinking' | 'using-gmail' | 'using-calendar' | 'done';

export type AgentSessionOption = {
  id: string;
  label: string;
  updatedAt: number;
};

export type AgentHistoryItem = {
  id: string;
  preview: string;
  timestamp?: string;
};

type MenuId = 'conversation' | 'history' | 'more';

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: 'Ready',
  thinking: 'Thinking…',
  'using-gmail': 'Using Gmail',
  'using-calendar': 'Using Calendar',
  done: 'Done',
};

function formatSessionDate(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const MENU_PANEL =
  'overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-elevated-bg)] shadow-[0_12px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5';

export function AgentHeader({
  status,
  sessionLabel = 'New conversation',
  sessions = [],
  currentSessionId,
  historyItems = [],
  onNewConversation,
  onSelectSession,
  onHistorySelect,
  onShare,
  onClear,
  onCopyTranscript,
}: {
  status: AgentStatus;
  sessionLabel?: string;
  sessions?: AgentSessionOption[];
  currentSessionId?: string;
  historyItems?: AgentHistoryItem[];
  onNewConversation: () => void;
  onSelectSession: (id: string) => void;
  onHistorySelect?: (id: string) => void;
  onShare: () => void;
  onClear: () => void;
  onCopyTranscript: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const conversationRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const anchorFor = (menu: MenuId) => {
    if (menu === 'conversation') return conversationRef.current;
    if (menu === 'history') return historyRef.current;
    return moreRef.current;
  };

  const positionMenu = useCallback((menu: MenuId) => {
    const el = anchorFor(menu);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelWidth = menu === 'conversation' ? 240 : menu === 'history' ? 280 : 220;
    let left = menu === 'conversation' ? rect.left : rect.right - panelWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
    setMenuPos({ top: rect.bottom + 6, left, width: panelWidth });
  }, []);

  useLayoutEffect(() => {
    if (!openMenu) {
      setMenuPos(null);
      return;
    }
    positionMenu(openMenu);
    const onResize = () => positionMenu(openMenu);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [openMenu, positionMenu]);

  const toggle = (menu: MenuId) => setOpenMenu((prev) => (prev === menu ? null : menu));
  const close = () => setOpenMenu(null);

  const handleShare = async () => {
    close();
    try {
      await onShare();
    } catch {
      toast.error('Could not share');
    }
  };

  const menuContent = () => {
    if (!openMenu || !menuPos) return null;

    if (openMenu === 'conversation') {
      return (
        <div style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }} className={cn('fixed z-[200]', MENU_PANEL)}>
          <button
            type="button"
            onClick={() => {
              close();
              onNewConversation();
              toast.success('New conversation started');
            }}
            className={cn('flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-medium', dash.hover, dash.text)}
          >
            <Plus size={16} className={dash.accent} />
            New conversation
          </button>
          {sessions.length > 0 && (
            <>
              <div className={cn('border-t px-3 py-2 text-[10px] font-semibold uppercase tracking-wider', dash.border, dash.textSubtle)}>
                Recent chats
              </div>
              <div className="max-h-52 overflow-y-auto py-1">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      close();
                      onSelectSession(s.id);
                      toast.success('Conversation loaded');
                    }}
                    className={cn(
                      'mx-1 flex w-[calc(100%-0.5rem)] items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm',
                      dash.hover,
                      s.id === currentSessionId ? dash.accentSoft : dash.text
                    )}
                  >
                    <span className="truncate">{s.label}</span>
                    <span className={cn('shrink-0 text-[10px]', dash.textSubtle)}>{formatSessionDate(s.updatedAt)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    if (openMenu === 'history') {
      return (
        <div style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }} className={cn('fixed z-[200]', MENU_PANEL)}>
          <div className={cn('border-b px-3 py-2.5', dash.border)}>
            <p className={cn('text-xs font-semibold', dash.text)}>Prompt history</p>
            <p className={cn('text-[10px]', dash.textMuted)}>Tap a prompt to reuse it in the input</p>
          </div>
          {historyItems.length === 0 ? (
            <p className={cn('px-3 py-5 text-center text-xs', dash.textMuted)}>No prompts in this chat yet.</p>
          ) : (
            <div className="max-h-56 overflow-y-auto py-1">
              {historyItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    close();
                    onHistorySelect?.(item.id);
                    toast.success('Prompt added to input');
                  }}
                  className={cn('mx-1 flex w-[calc(100%-0.5rem)] flex-col gap-0.5 rounded-lg px-2.5 py-2 text-left', dash.hover)}
                >
                  <span className={cn('line-clamp-2 text-xs leading-relaxed', dash.text)}>{item.preview}</span>
                  {item.timestamp && <span className={cn('text-[10px]', dash.textSubtle)}>{item.timestamp}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }} className={cn('fixed z-[200]', MENU_PANEL)}>
        <div className="py-1">
          <button
            type="button"
            onClick={() => {
              close();
              void onCopyTranscript();
            }}
            className={cn('flex w-full items-center gap-2.5 px-3 py-2.5 text-sm', dash.hover, dash.text)}
          >
            <Copy size={15} className={dash.textMuted} />
            Copy transcript
          </button>
          <button
            type="button"
            onClick={() => {
              close();
              onNewConversation();
              toast.success('New conversation started');
            }}
            className={cn('flex w-full items-center gap-2.5 px-3 py-2.5 text-sm', dash.hover, dash.text)}
          >
            <MessageSquare size={15} className={dash.textMuted} />
            New conversation
          </button>
          <div className={cn('my-1 border-t', dash.border)} />
          <button
            type="button"
            onClick={() => {
              close();
              onClear();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
          >
            <Trash2 size={15} />
            Clear chat
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={cn('relative z-30 shrink-0 border-b px-3 py-2.5', dash.glassToolbar, dash.border)}>
        <div className="flex items-center gap-0.5">
          <div className="min-w-0 flex-1">
            <button
              ref={conversationRef}
              type="button"
              onClick={() => toggle('conversation')}
              className={cn(
                'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm font-semibold',
                dash.hover,
                dash.text,
                openMenu === 'conversation' && dash.accentSoft
              )}
            >
              <span className="truncate">{sessionLabel}</span>
              <ChevronDown
                size={14}
                className={cn('shrink-0 transition-transform', dash.textMuted, openMenu === 'conversation' && 'rotate-180')}
              />
            </button>
          </div>

          <button
            ref={historyRef}
            type="button"
            title="Prompt history"
            onClick={() => toggle('history')}
            className={cn(
              'rounded-lg p-2 transition-colors',
              dash.hover,
              dash.textMuted,
              openMenu === 'history' && dash.accentSoft
            )}
          >
            <Clock size={16} />
          </button>

          <button
            type="button"
            title="Share transcript"
            onClick={handleShare}
            className={cn('rounded-lg p-2 transition-colors', dash.hover, dash.textMuted)}
          >
            <Share2 size={16} />
          </button>

          <button
            ref={moreRef}
            type="button"
            title="More options"
            onClick={() => toggle('more')}
            className={cn(
              'rounded-lg p-2 transition-colors',
              dash.hover,
              dash.textMuted,
              openMenu === 'more' && dash.accentSoft
            )}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-2 px-2">
          <span className={cn('relative flex h-2 w-2', status !== 'idle' && status !== 'done' && 'animate-pulse')}>
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-60',
                status === 'done' ? 'bg-emerald-500' : 'bg-[var(--dash-accent)]'
              )}
            />
            <span
              className={cn(
                'relative inline-flex h-2 w-2 rounded-full',
                status === 'done' ? 'bg-emerald-500' : 'bg-[var(--dash-accent)]'
              )}
            />
          </span>
          <span className={cn('text-[11px] font-medium', dash.textMuted)}>{STATUS_LABEL[status]}</span>
        </div>
      </div>

      {mounted &&
        openMenu &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[190] bg-black/25 backdrop-blur-[1px]"
              onClick={close}
            />
            {menuContent()}
          </>,
          document.body
        )}
    </>
  );
}
