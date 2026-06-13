'use client';
import { useState, useEffect } from 'react';
import { Archive, Trash2, Star, Reply, X, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FullBody {
  text: string;
  html: string;
}

export function EmailDetail({
  email,
  onClose,
  onRefresh,
}: {
  email: any;
  onClose: () => void;
  onRefresh?: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [fullBody, setFullBody] = useState<FullBody | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);

  // Fetch full message body when email is selected
  useEffect(() => {
    if (!email?.id) return;
    setFullBody(null);
    setBodyLoading(true);

    fetch(`/api/gmail/message/${email.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.body) {
          setFullBody(data.body);
        }
      })
      .catch(() => {
        // Non-fatal — fall back to snippet
      })
      .finally(() => setBodyLoading(false));
  }, [email?.id]);

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

  const sendReply = async () => {
    if (!replyBody.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/gmail/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.data?.from,
          subject: email.data?.subject,
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

  // Render body content: prefer full HTML → plain text → snippet
  const renderBody = () => {
    if (bodyLoading) {
      return (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-8">
          <Loader2 size={16} className="animate-spin" />
          Loading full message…
        </div>
      );
    }
    if (fullBody?.html) {
      return (
        <iframe
          srcDoc={fullBody.html}
          sandbox="allow-same-origin"
          className="w-full min-h-[300px] border-0 bg-white rounded-lg"
          style={{ colorScheme: 'light' }}
          onLoad={e => {
            const iframe = e.currentTarget;
            iframe.style.height =
              (iframe.contentDocument?.body?.scrollHeight || 300) + 'px';
          }}
          title="Email body"
        />
      );
    }
    if (fullBody?.text) {
      return (
        <pre className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-sans">
          {fullBody.text}
        </pre>
      );
    }
    return (
      <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">
        {email.data?.body || email.snippet || '(No content available)'}
      </p>
    );
  };

  return (
    <div className="w-1/2 border-l border-[#1e293b] bg-[#0d1425] h-full flex flex-col overflow-hidden">
      {/* Action Bar */}
      <div className="h-[60px] border-b border-[#1e293b] flex items-center justify-between px-4 shrink-0 bg-[#0a0f1e]">
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => doAction('archive')}
            disabled={isActing}
            className="p-2 hover:bg-[#1a2235] hover:text-slate-200 rounded-lg transition-colors"
            title="Archive (e)"
          >
            <Archive size={18} />
          </button>
          <button
            onClick={() => doAction('trash')}
            disabled={isActing}
            className="p-2 hover:bg-[#1a2235] hover:text-red-400 rounded-lg transition-colors"
            title="Trash (#)"
          >
            <Trash2 size={18} />
          </button>
          <div className="w-px h-5 bg-[#1e293b] mx-1" />
          <button
            onClick={() => doAction('star')}
            disabled={isActing}
            className="p-2 hover:bg-[#1a2235] hover:text-[#c9a84c] rounded-lg transition-colors"
            title="Star (s)"
          >
            <Star size={18} />
          </button>
          <button
            onClick={() => setShowReply(r => !r)}
            className="p-2 hover:bg-[#1a2235] hover:text-[#c9a84c] rounded-lg transition-colors"
            title="Reply (r)"
          >
            <Reply size={18} />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#1a2235] text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-bold text-slate-100 mb-4">
          {email.data?.subject || '(no subject)'}
        </h1>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#1a2235] border border-[#c9a84c] flex items-center justify-center font-bold text-[#c9a84c] text-sm shrink-0">
            {(email.data?.from || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-200">
                {email.data?.from || 'Unknown'}
              </span>
              <span className="text-slate-500 text-xs">to me</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {email.data?.date
                ? new Date(email.data.date).toLocaleString()
                : 'No date'}
            </div>
          </div>
        </div>

        {email.priority && email.priority !== 'FYI' && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-4 ${
              email.priority === 'URGENT'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {email.priority}
          </div>
        )}

        <div className="border-t border-[#1e293b] pt-4">{renderBody()}</div>
      </div>

      {/* Inline Reply Box */}
      {showReply && (
        <div className="border-t border-[#1e293b] p-4 bg-[#0a0f1e] shrink-0">
          <div className="text-xs text-slate-500 mb-2">
            Replying to{' '}
            <span className="text-slate-300">{email.data?.from}</span>
          </div>
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            className="w-full bg-[#1a2235] border border-[#1e293b] rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#c9a84c] resize-none"
            rows={4}
            placeholder="Write your reply…"
            autoFocus
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={sendReply}
              disabled={isSending || !replyBody.trim()}
              className="bg-[#c9a84c] hover:bg-[#d4b55c] text-[#0a0f1e] font-semibold py-1.5 px-5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} />
              {isSending ? 'Sending…' : 'Send Reply'}
            </button>
            <button
              onClick={() => {
                setShowReply(false);
                setReplyBody('');
              }}
              className="text-slate-500 hover:text-slate-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      <div className="border-t border-[#1e293b] px-4 py-2 flex items-center gap-4 text-xs text-slate-600 bg-[#0a0f1e] shrink-0">
        <span>
          <kbd className="border border-[#1e293b] rounded px-1">e</kbd> Archive
        </span>
        <span>
          <kbd className="border border-[#1e293b] rounded px-1">#</kbd> Trash
        </span>
        <span>
          <kbd className="border border-[#1e293b] rounded px-1">r</kbd> Reply
        </span>
        <span>
          <kbd className="border border-[#1e293b] rounded px-1">s</kbd> Star
        </span>
      </div>
    </div>
  );
}
