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
  // Enriched header data from full message fetch
  const [fullMeta, setFullMeta] = useState<{
    from?: string;
    fromEmail?: string;
    subject?: string;
  } | null>(null);

  // Fetch full message body + headers when email is selected
  useEffect(() => {
    if (!email?.id) return;
    setFullBody(null);
    setFullMeta(null);
    setBodyLoading(true);

    fetch(`/api/gmail/message/${email.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.body) setFullBody(data.body);
        // Capture enriched header data (real email address, full subject)
        if (data.from || data.subject) {
          // Extract the email address from the full From header
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
      .catch(() => {
        // Non-fatal — fall back to list metadata
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
      // Prefer the real email address from the full message fetch (fullMeta),
      // then fall back to the fromEmail set by the list route, then the raw from
      const replyTo =
        fullMeta?.fromEmail ||
        email.data?.fromEmail ||
        email.data?.from ||
        '';
      if (!replyTo || replyTo === 'Unknown Sender') {
        toast.error('Cannot reply: sender email address is unknown.');
        return;
      }
      const replySubject =
        fullMeta?.subject || email.data?.subject || '(no subject)';
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


  // Render body content: prefer full HTML → plain text → snippet
  const renderBody = () => {
    if (bodyLoading) {
      return (
        <div className="flex items-center gap-2 text-green-800 text-sm py-8">
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
        <pre className="text-red-700 leading-relaxed text-sm whitespace-pre-wrap font-sans">
          {fullBody.text}
        </pre>
      );
    }
    return (
      <p className="text-green-900 leading-relaxed text-sm whitespace-pre-wrap">
        {email.data?.body || email.snippet || '(No content available)'}
      </p>
    );
  };

  return (
    <div className="w-1/2 border-l border-[#FBC02D] bg-[#FFF59D] h-full flex flex-col overflow-hidden">
      {/* Action Bar */}
      <div className="h-[60px] border-b border-[#FBC02D] flex items-center justify-between px-4 shrink-0 bg-[#FFF9C4]">
        <div className="flex items-center gap-1 text-green-900">
          <button
            onClick={() => doAction('archive')}
            disabled={isActing}
            className="p-2 hover:bg-[#FFEE58] hover:text-red-800 rounded-lg transition-colors"
            title="Archive (e)"
          >
            <Archive size={18} />
          </button>
          <button
            onClick={() => doAction('trash')}
            disabled={isActing}
            className="p-2 hover:bg-[#FFEE58] hover:text-red-400 rounded-lg transition-colors"
            title="Trash (#)"
          >
            <Trash2 size={18} />
          </button>
          <div className="w-px h-5 bg-[#FBC02D] mx-1" />
          <button
            onClick={() => doAction('star')}
            disabled={isActing}
            className="p-2 hover:bg-[#FFEE58] hover:text-[#D32F2F] rounded-lg transition-colors"
            title="Star (s)"
          >
            <Star size={18} />
          </button>
          <button
            onClick={() => setShowReply(r => !r)}
            className="p-2 hover:bg-[#FFEE58] hover:text-[#D32F2F] rounded-lg transition-colors"
            title="Reply (r)"
          >
            <Reply size={18} />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#FFEE58] text-green-900 hover:text-red-800 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-bold text-red-900 mb-4">
          {fullMeta?.subject || email.data?.subject || '(no subject)'}
        </h1>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#FFEE58] border border-[#D32F2F] flex items-center justify-center font-bold text-[#D32F2F] text-sm shrink-0">
            {(fullMeta?.from || email.data?.from || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-red-800">
                {fullMeta?.from || email.data?.from || 'Unknown'}
              </span>
              {(fullMeta?.fromEmail || email.data?.fromEmail) && (
                <span className="text-green-700 text-xs">
                  &lt;{fullMeta?.fromEmail || email.data?.fromEmail}&gt;
                </span>
              )}
              <span className="text-green-800 text-xs">to me</span>
            </div>
            <div className="text-xs text-green-800 mt-0.5">
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

        <div className="border-t border-[#FBC02D] pt-4">{renderBody()}</div>
      </div>

      {/* Inline Reply Box */}
      {showReply && (
        <div className="border-t border-[#FBC02D] p-4 bg-[#FFF9C4] shrink-0">
          <div className="text-xs text-green-800 mb-2">
            Replying to{' '}
            <span className="text-red-700">
              {fullMeta?.from || email.data?.from || 'sender'}
              {(fullMeta?.fromEmail || email.data?.fromEmail) && (
                <> ({fullMeta?.fromEmail || email.data?.fromEmail})</>
              )}
            </span>
          </div>
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            className="w-full bg-[#FFEE58] border border-[#FBC02D] rounded-xl p-3 text-sm text-red-800 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#D32F2F] resize-none"
            rows={4}
            placeholder="Write your reply…"
            autoFocus
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={sendReply}
              disabled={isSending || !replyBody.trim()}
              className="bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] font-semibold py-1.5 px-5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} />
              {isSending ? 'Sending…' : 'Send Reply'}
            </button>
            <button
              onClick={() => {
                setShowReply(false);
                setReplyBody('');
              }}
              className="text-green-800 hover:text-red-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      <div className="border-t border-[#FBC02D] px-4 py-2 flex items-center gap-4 text-xs text-green-700 bg-[#FFF9C4] shrink-0">
        <span>
          <kbd className="border border-[#FBC02D] rounded px-1">e</kbd> Archive
        </span>
        <span>
          <kbd className="border border-[#FBC02D] rounded px-1">#</kbd> Trash
        </span>
        <span>
          <kbd className="border border-[#FBC02D] rounded px-1">r</kbd> Reply
        </span>
        <span>
          <kbd className="border border-[#FBC02D] rounded px-1">s</kbd> Star
        </span>
      </div>
    </div>
  );
}
