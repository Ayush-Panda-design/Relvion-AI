'use client';

import { useState, useEffect, useRef } from 'react';
import { Archive, Trash2, Star, Reply, X, Send, Loader2, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import type { EmailShortcutHandlers } from '@/hooks/useKeyboardShortcuts';
import { TemplatePicker } from './TemplatePicker';

interface FullBody {
  text: string;
  html: string;
}

type ThreadMessage = {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  date: string;
  body: FullBody;
  snippet: string;
};

const SNOOZE_OPTIONS = [
  { preset: 'later_today', label: 'Later today (6 PM)' },
  { preset: 'tomorrow', label: 'Tomorrow morning' },
  { preset: 'next_week', label: 'Next week' },
] as const;

export function EmailDetail({
  email,
  onClose,
  onRefresh,
  onRegisterShortcuts,
}: {
  email: any;
  onClose: () => void;
  onRefresh?: () => void;
  onRegisterShortcuts?: (handlers: EmailShortcutHandlers | null) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [fullBody, setFullBody] = useState<FullBody | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [fullMeta, setFullMeta] = useState<{
    from?: string;
    fromEmail?: string;
    subject?: string;
  } | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);
  const showReplyRef = useRef(showReply);
  showReplyRef.current = showReply;

  useEffect(() => {
    if (!email?.id) return;
    setFullBody(null);
    setFullMeta(null);
    setThreadMessages([]);
    setExpandedIds(new Set([email.id]));
    setBodyLoading(true);
    setThreadLoading(!!email.threadId);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    const messagePromise = fetch(`/api/gmail/message/${email.id}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.body) setFullBody(data.body);
        if (data.from || data.subject) {
          const rawFrom: string = data.from || '';
          const addrMatch = rawFrom.match(/<([^>]+)>/);
          const fromEmail = addrMatch ? addrMatch[1].trim() : rawFrom.trim();
          const displayName = rawFrom.includes('<')
            ? rawFrom.replace(/<[^>]+>/, '').trim()
            : rawFrom.trim();
          setFullMeta({
            from: displayName || fromEmail,
            fromEmail,
            subject: data.subject,
          });
        }
      })
      .catch(() => {})
      .finally(() => setBodyLoading(false));

    const threadPromise = email.threadId
      ? fetch(`/api/gmail/thread/${email.threadId}`, { signal: controller.signal })
          .then((r) => r.json())
          .then((data) => {
            if (data.messages?.length) {
              setThreadMessages(data.messages);
              setExpandedIds(new Set([data.messages[data.messages.length - 1].id]));
            }
          })
          .catch(() => {})
          .finally(() => setThreadLoading(false))
      : Promise.resolve();

    void Promise.all([messagePromise, threadPromise]).finally(() => {
      window.clearTimeout(timeout);
      setThreadLoading(false);
    });
  }, [email?.id, email?.threadId]);

  useEffect(() => {
    if (!onRegisterShortcuts) return;

    const runAction = async (action: string) => {
      setIsActing(true);
      try {
        const res = await fetch('/api/gmail/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: email.id, action }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Action failed');
        toast.success(
          action === 'archive'
            ? 'Archived!'
            : action === 'trash'
              ? 'Moved to trash!'
              : action === 'star'
                ? 'Starred!'
                : 'Done!'
        );
        if (action === 'archive' || action === 'trash') {
          onClose();
          onRefresh?.();
        }
      } catch (err: any) {
        toast.error(err.message || 'Action failed');
      } finally {
        setIsActing(false);
      }
    };

    onRegisterShortcuts({
      archive: () => void runAction('archive'),
      trash: () => void runAction('trash'),
      star: () => void runAction('star'),
      reply: () => {
        if (!showReplyRef.current) setShowReply(true);
      },
      close: onClose,
    });

    return () => onRegisterShortcuts(null);
  }, [email?.id, onClose, onRefresh, onRegisterShortcuts]);

  if (!email) return null;

  const doAction = async (action: string) => {
    setIsActing(true);
    try {
      const res = await fetch('/api/gmail/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: email.id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      toast.success(
        action === 'archive' ? 'Archived!' : action === 'trash' ? 'Moved to trash!' : action === 'star' ? 'Starred!' : 'Done!'
      );
      if (action === 'archive' || action === 'trash') {
        onClose();
        onRefresh?.();
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setIsActing(false);
    }
  };

  const sendReply = async () => {
    if (!replyBody.trim()) return;
    setIsSending(true);
    try {
      const replyTo = fullMeta?.fromEmail || email.data?.fromEmail || email.data?.from || '';
      if (!replyTo || replyTo === 'Unknown Sender') {
        toast.error('Cannot reply: sender email address is unknown.');
        return;
      }
      const replySubject = fullMeta?.subject || email.data?.subject || '(no subject)';
      const res = await fetch('/api/gmail/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: replyTo,
          subject: replySubject,
          body: replyBody,
          threadId: email.threadId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');
      toast.success('Reply sent!');
      setShowReply(false);
      setReplyBody('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleSnooze = async (preset: string) => {
    setIsSnoozing(true);
    setShowSnoozeMenu(false);
    try {
      const res = await fetch('/api/gmail/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: email.id,
          threadId: email.threadId,
          preset,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Snooze failed');
      toast.success('Snoozed — will return to inbox later');
      onClose();
      onRefresh?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Snooze failed');
    } finally {
      setIsSnoozing(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderMessageBody = (body: FullBody | null, fallback?: string) => {
    if (body?.html) {
      return (
        <iframe
          srcDoc={body.html}
          sandbox="allow-same-origin"
          className="min-h-[200px] w-full rounded-xl border-0 bg-[#FAF9F6] dark:bg-[#292a2d]"
          style={{ colorScheme: 'light' }}
          onLoad={(e) => {
            const iframe = e.currentTarget;
            iframe.style.height = (iframe.contentDocument?.body?.scrollHeight || 200) + 'px';
          }}
          title="Email body"
        />
      );
    }
    if (body?.text) {
      return (
        <pre className={cn('whitespace-pre-wrap font-sans text-sm leading-relaxed', dash.text)}>
          {body.text}
        </pre>
      );
    }
    return (
      <p className={cn('whitespace-pre-wrap text-sm leading-relaxed', dash.textMuted)}>
        {fallback || '(No content available)'}
      </p>
    );
  };

  const renderBody = () => {
    if (threadMessages.length > 1) {
      return (
        <div className="space-y-3">
          {threadMessages.map((msg, idx) => {
            const expanded = expandedIds.has(msg.id);
            return (
              <div
                key={msg.id}
                className={cn('rounded-xl border', dash.border, expanded ? dash.surface : 'bg-transparent')}
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(msg.id)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                    dash.hover
                  )}
                >
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase', dash.avatar)}>
                    {msg.from.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('text-sm font-semibold', dash.text)}>{msg.from}</span>
                      <span className={cn('text-xs', dash.textSubtle)}>
                        {new Date(msg.date).toLocaleString()}
                      </span>
                      {idx === threadMessages.length - 1 && (
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', dash.accentSoftBg)}>
                          Latest
                        </span>
                      )}
                    </div>
                    {!expanded && (
                      <p className={cn('mt-1 truncate text-sm', dash.textMuted)}>{msg.snippet}</p>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={cn('shrink-0 transition-transform', dash.textMuted, expanded && 'rotate-180')}
                  />
                </button>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t px-4 py-4"
                    >
                      {renderMessageBody(msg.body, msg.snippet)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      );
    }

    if (bodyLoading && !fullBody) {
      return (
        <div className={cn('flex items-center gap-2 py-8 text-sm', dash.textMuted)}>
          <Loader2 size={16} className={cn('animate-spin', dash.accent)} />
          {threadLoading ? 'Loading conversation…' : 'Loading full message…'}
        </div>
      );
    }
    return renderMessageBody(fullBody, email.data?.body || email.snippet);
  };

  const ActionBtn = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={isActing}
      title={title}
      className={cn('rounded-lg p-2 transition-colors', dash.hover, dash.textMuted, dash.accentHover)}
    >
      {children}
    </motion.button>
  );

  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col overflow-hidden border-l', dash.surface, dash.border)}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center justify-between border-b px-4',
          dash.elevated,
          dash.border
        )}
      >
        <div className="flex items-center gap-0.5">
          <ActionBtn onClick={() => doAction('archive')} title="Archive (e)">
            <Archive size={18} />
          </ActionBtn>
          <ActionBtn onClick={() => doAction('trash')} title="Trash (#)">
            <Trash2 size={18} />
          </ActionBtn>
          <div className={cn('mx-1 h-5 w-px', dash.divider)} />
          <ActionBtn onClick={() => doAction('star')} title="Star (s)">
            <Star size={18} />
          </ActionBtn>
          <ActionBtn onClick={() => setShowReply((r) => !r)} title="Reply (r)">
            <Reply size={18} />
          </ActionBtn>
          <div className="relative">
            <ActionBtn
              onClick={() => setShowSnoozeMenu((v) => !v)}
              title="Snooze"
            >
              {isSnoozing ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
            </ActionBtn>
            {showSnoozeMenu && (
              <div
                className={cn(
                  'absolute left-0 top-full z-30 mt-1 min-w-[180px] overflow-hidden rounded-xl border shadow-lg',
                  dash.elevated,
                  dash.border
                )}
              >
                {SNOOZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.preset}
                    type="button"
                    onClick={() => void handleSnooze(opt.preset)}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-xs transition-colors',
                      dash.hover,
                      dash.text
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className={cn('rounded-lg p-2 transition-colors', dash.hover, dash.textMuted)}
        >
          <X size={18} />
        </motion.button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('mb-5 text-xl font-bold tracking-tight', dash.text)}
        >
          {fullMeta?.subject || email.data?.subject || '(no subject)'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 flex items-start gap-4"
        >
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase', dash.avatar)}>
            {(fullMeta?.from || email.data?.from || 'U').charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('font-semibold', dash.text)}>
                {fullMeta?.from || email.data?.from || 'Unknown'}
              </span>
              {(fullMeta?.fromEmail || email.data?.fromEmail) && (
                <span className={cn('text-xs', dash.textSubtle)}>
                  &lt;{fullMeta?.fromEmail || email.data?.fromEmail}&gt;
                </span>
              )}
              <span className={cn('text-xs', dash.textSubtle)}>to me</span>
            </div>
            <div className={cn('mt-0.5 text-xs', dash.textSubtle)}>
              {email.data?.date ? new Date(email.data.date).toLocaleString() : 'No date'}
            </div>
          </div>
        </motion.div>

        {email.priority && email.priority !== 'FYI' && (
          <span
            className={cn(
              'mb-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
              email.priority === 'URGENT'
                ? 'bg-red-500/15 text-red-500'
                : 'bg-blue-500/15 text-blue-500'
            )}
          >
            {email.priority}
          </span>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={cn('border-t pt-5', dash.border)}
        >
          {renderBody()}
        </motion.div>
      </div>

      {showReply && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('shrink-0 border-t p-4', dash.elevated, dash.border)}
        >
          <div className={cn('mb-2 text-xs', dash.textSubtle)}>
            Replying to{' '}
            <span className={dash.accent}>
              {fullMeta?.from || email.data?.from || 'sender'}
              {(fullMeta?.fromEmail || email.data?.fromEmail) && (
                <> ({fullMeta?.fromEmail || email.data?.fromEmail})</>
              )}
            </span>
          </div>
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            className={cn(
              'w-full resize-none rounded-xl border p-3 text-sm focus:outline-none focus:ring-2',
              dash.accentRing,
              dash.input,
              dash.text
            )}
            rows={4}
            placeholder="Write your reply…"
            autoFocus
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={sendReply}
              disabled={isSending || !replyBody.trim()}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-50',
                dash.accentBg
              )}
            >
              <Send size={14} />
              {isSending ? 'Sending…' : 'Send Reply'}
            </motion.button>
            <button
              type="button"
              onClick={() => {
                setShowReply(false);
                setReplyBody('');
              }}
              className={cn('text-sm transition-colors', dash.textMuted, dash.accentHover)}
            >
              Cancel
            </button>
            </div>
            <TemplatePicker
              onSelect={(t) => {
                if (t.body) setReplyBody((prev) => (prev ? `${prev}\n\n${t.body}` : t.body || ''));
              }}
            />
          </div>
        </motion.div>
      )}

      <div
        className={cn(
          'flex shrink-0 items-center gap-4 border-t px-4 py-2 text-xs',
          dash.elevated,
          dash.border,
          dash.textSubtle
        )}
      >
        <span>
          <kbd className={cn('rounded border px-1', dash.border)}>e</kbd> Archive
        </span>
        <span>
          <kbd className={cn('rounded border px-1', dash.border)}>#</kbd> Trash
        </span>
        <span>
          <kbd className={cn('rounded border px-1', dash.border)}>r</kbd> Reply
        </span>
        <span>
          <kbd className={cn('rounded border px-1', dash.border)}>s</kbd> Star
        </span>
      </div>
    </div>
  );
}
