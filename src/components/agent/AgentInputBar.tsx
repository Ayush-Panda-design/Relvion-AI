'use client';

import { useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { QUICK_ACTIONS } from './AgentEmptyState';

export function AgentInputBar({
  input,
  setInput,
  sending,
  attachedCount,
  onAttach,
  onSend,
  onClearFiles,
  fileInputRef,
  onFileSelect,
  showQuickActions,
  onQuickAction,
}: {
  input: string;
  setInput: (v: string) => void;
  sending: boolean;
  attachedCount: number;
  onAttach: () => void;
  onSend: () => void;
  onClearFiles: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showQuickActions: boolean;
  onQuickAction: (prompt: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={cn('shrink-0 border-t p-3', dash.glassToolbar, dash.border)}>
      {showQuickActions && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={sending}
              onClick={() => onQuickAction(a.prompt)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[10px] font-medium',
                dash.border,
                dash.hover,
                dash.textMuted
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div className={cn('flex items-end gap-1 rounded-2xl border p-1.5', dash.border)}>
        <button
          type="button"
          onClick={onAttach}
          className={cn('mb-1 shrink-0 rounded-lg p-2', dash.hover, dash.textMuted, dash.accentHover)}
          title="Attach files"
        >
          <Paperclip size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.txt,.csv,.json,.md,video/*,audio/*"
          className="hidden"
          onChange={onFileSelect}
        />
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything…"
          disabled={sending}
          className={cn(
            'max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent py-2 pl-1 pr-2 text-sm focus:outline-none disabled:opacity-50',
            dash.text,
            'placeholder:text-[var(--dash-text-subtle)]'
          )}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sending || (!input.trim() && attachedCount === 0)}
          className={cn(
            'mb-1 shrink-0 rounded-xl p-2 transition-all disabled:opacity-30',
            dash.accentBg
          )}
        >
          <Send size={16} />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-1">
        <span className={cn('text-[9px]', dash.textSubtle)}>
          ⌘+Enter to send · Images, PDFs up to 10MB
        </span>
        <div className="flex items-center gap-2">
          {input.length > 200 && (
            <span className={cn('text-[9px] tabular-nums', dash.textSubtle)}>{input.length}</span>
          )}
          {attachedCount > 0 && (
            <button
              type="button"
              onClick={onClearFiles}
              className={cn('flex items-center gap-1 text-[9px]', dash.accent, dash.accentHover)}
            >
              <X size={10} />
              Clear {attachedCount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
