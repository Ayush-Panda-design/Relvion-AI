'use client';

import { motion } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

export type ChatMessageData = {
  role: 'user' | 'agent';
  content: string;
  attachments?: { name: string; type: string; preview?: string }[];
};

function CopyButton({ text, isUser }: { text: string; isUser: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(isUser ? 'Prompt copied' : 'Response copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }, [text, isUser]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={isUser ? 'Copy prompt' : 'Copy response'}
      className={cn(
        'rounded-md p-1 opacity-0 shadow-sm transition-all group-hover/message:opacity-100',
        dash.chatCopyBtn
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

export function ChatMessage({
  message,
  index = 0,
}: {
  message: ChatMessageData;
  index?: number;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: Math.min(index * 0.04, 0.2),
        duration: 0.35,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1',
          isUser ? dash.avatar : cn(dash.accentSoftBg, 'ring-[#0D9488]/15 dark:ring-[#8ab4f8]/20')
        )}
      >
        {isUser ? (
          <User size={14} className={dash.accent} />
        ) : (
          <Bot size={14} className={dash.accent} />
        )}
      </div>

      <div className={cn('flex max-w-[85%] flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <span className={cn('px-1 text-[10px] font-medium uppercase tracking-wider', dash.textSubtle)}>
          {isUser ? 'You' : 'Relvion'}
        </span>

        {message.attachments && message.attachments.length > 0 && (
          <div className={cn('flex flex-wrap gap-1.5', isUser ? 'justify-end' : 'justify-start')}>
            {message.attachments.map((att, j) => (
              <div
                key={j}
                className={cn(
                  'overflow-hidden rounded-lg border transition-transform hover:scale-[1.02]',
                  dash.chatAttachment
                )}
              >
                {att.type.startsWith('image/') && att.preview ? (
                  <img src={att.preview} alt={att.name} className="h-16 w-16 object-cover" />
                ) : (
                  <div className={cn('px-2 py-1 text-[10px]', dash.text)}>{att.name}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {message.content && (
          <div className={cn('group/message relative flex items-start gap-1', isUser && 'flex-row-reverse')}>
            <CopyButton text={message.content} isUser={isUser} />
            <div
              className={cn(
                'whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere]',
                'backdrop-blur-sm transition-shadow duration-200',
                isUser
                  ? cn('rounded-br-md shadow-sm', dash.chatUser)
                  : cn(
                      'rounded-bl-md border shadow-[0_2px_12px_rgba(0,0,0,0.06)]',
                      dash.chatAgent,
                      'dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]'
                    )
              )}
            >
              {message.content}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
