'use client';

import { motion } from 'framer-motion';
import { Bot, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { MarkdownLite } from '@/lib/markdown-lite';
import { AgentActivityTrace } from '@/components/agent/AgentActivityTrace';
import { ContactAvatar } from '@/components/ui/ContactAvatar';
import type { AgentStep } from '@/lib/agent-stream';

export type ChatMessageData = {
  role: 'user' | 'agent';
  content: string;
  timestamp?: string;
  streaming?: boolean;
  steps?: AgentStep[];
  attachments?: { name: string; type: string; preview?: string }[];
};

function UserInitials() {
  return <ContactAvatar name="You" initials="U" sizeClass="h-8 w-8 text-xs" />;
}

export function ChatMessage({
  message,
  index = 0,
  onRegenerate,
}: {
  message: ChatMessageData;
  index?: number;
  onRegenerate?: () => void;
}) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy');
    }
  }, [message.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.15), duration: 0.28 }}
      className={cn('group flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}
    >
      <div className={cn('flex w-full gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {isUser ? <UserInitials /> : (
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', dash.accentSoftBg)}>
            <Bot size={14} className={dash.accent} />
          </div>
        )}

        <div className={cn('min-w-0 max-w-[92%]', isUser ? 'items-end' : 'items-start')}>
          {!isUser && message.steps && message.steps.length > 0 && (
            <AgentActivityTrace steps={message.steps} />
          )}

          {message.attachments && message.attachments.length > 0 && (
            <div className={cn('mb-1 flex flex-wrap gap-1.5', isUser && 'justify-end')}>
              {message.attachments.map((att, j) => (
                <div key={j} className={cn('overflow-hidden rounded-lg border text-[10px] px-2 py-1', dash.chatAttachment)}>
                  {att.name}
                </div>
              ))}
            </div>
          )}

          {(message.content || message.streaming) && (
            <div
              className={cn(
                'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                isUser
                  ? cn('rounded-br-md', dash.chatUser)
                  : cn('rounded-bl-md border', dash.chatAgent)
              )}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                <>
                  {message.content ? <MarkdownLite content={message.content} /> : null}
                  {message.streaming && (
                    <span className={cn('ml-0.5 inline-block h-4 w-0.5 animate-pulse align-middle', dash.accentBg)} />
                  )}
                </>
              )}
            </div>
          )}

          <div className={cn('mt-1 flex items-center gap-1', isUser ? 'justify-end' : 'justify-start')}>
            {message.timestamp && (
              <span className={cn('text-[10px] tabular-nums', dash.textSubtle)}>{message.timestamp}</span>
            )}
            {!isUser && message.content && !message.streaming && (
              <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setReaction('up')}
                  className={cn('rounded p-1', dash.hover, reaction === 'up' && dash.accentSoft)}
                  title="Good response"
                >
                  <ThumbsUp size={12} className={dash.textMuted} />
                </button>
                <button
                  type="button"
                  onClick={() => setReaction('down')}
                  className={cn('rounded p-1', dash.hover, reaction === 'down' && dash.accentSoft)}
                  title="Poor response"
                >
                  <ThumbsDown size={12} className={dash.textMuted} />
                </button>
                <button type="button" onClick={handleCopy} className={cn('rounded p-1', dash.hover)} title="Copy">
                  {copied ? <Check size={12} className={dash.accent} /> : <Copy size={12} className={dash.textMuted} />}
                </button>
                {onRegenerate && (
                  <button type="button" onClick={onRegenerate} className={cn('rounded p-1', dash.hover)} title="Regenerate">
                    <RotateCcw size={12} className={dash.textMuted} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
