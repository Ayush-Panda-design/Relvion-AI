'use client';
import { useState, useEffect, useCallback } from 'react';
import { Star, Archive, Trash2, RefreshCw } from 'lucide-react';
import { EmailDetail } from './EmailDetail';
import toast from 'react-hot-toast';

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'text-red-400 bg-red-500/10 border-red-500/20',
  IMPORTANT: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  FYI: 'text-green-800 bg-slate-500/10 border-slate-500/20',
};

export function EmailList({ folder }: { folder: string }) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'IMPORTANT'>('ALL');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [triaging, setTriaging] = useState<Set<string>>(new Set());

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gmail/list?folder=${folder}`);
      if (!res.ok) throw new Error('Failed to load emails');
      const data = await res.json();
      const fetched: any[] = data.emails || [];
      setEmails(fetched);

      // Trigger embedding ingestion in background (non-blocking)
      if (fetched.length > 0) {
        fetch('/api/gmail/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: fetched }),
        }).catch(() => {});
      }

      // Triage each email sequentially (100ms spacing to respect rate limits)
      setTriaging(new Set(fetched.map((e: any) => e.id)));
      const triageEmails = async () => {
        for (const email of fetched) {
          try {
            const res = await fetch('/api/gmail/triage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subject: email.data?.subject,
                body: email.data?.body || '',
                sender: email.data?.from,
              }),
            });
            if (res.ok) {
              const { priority } = await res.json();
              setEmails(prev =>
                prev.map(e => (e.id === email.id ? { ...e, priority } : e))
              );
            }
          } catch {
            // Non-fatal
          } finally {
            setTriaging(prev => {
              const next = new Set(prev);
              next.delete(email.id);
              return next;
            });
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      };
      triageEmails();
    } catch (e) {
      toast.error('Failed to load emails. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // SSE subscription — auto-refresh when new email arrives or is deleted
  useEffect(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (
          msg.type === 'EMAIL_RECEIVED' ||
          msg.type === 'EMAIL_UPDATED' ||
          msg.type === 'EMAIL_DELETED'
        ) {
          fetchEmails();
        }
      } catch {}
    };
    es.onerror = () => {
      // SSE connection dropped — will auto-reconnect; no user action needed
    };
    return () => es.close();
  }, [fetchEmails]);

  // Keyboard shortcuts for email detail view
  useEffect(() => {
    if (!selectedEmail) return;
    const handler = async (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === 'Escape') {
        setSelectedEmail(null);
        return;
      }
      if (e.key === 'e') {
        const res = await fetch('/api/gmail/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEmail.id, action: 'archive' }),
        });
        if (res.ok) {
          toast.success('Archived');
          setSelectedEmail(null);
          fetchEmails();
        }
      }
      if (e.key === '#') {
        const res = await fetch('/api/gmail/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEmail.id, action: 'trash' }),
        });
        if (res.ok) {
          toast.success('Moved to trash');
          setSelectedEmail(null);
          fetchEmails();
        }
      }
      if (e.key === 's') {
        const res = await fetch('/api/gmail/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedEmail.id, action: 'star' }),
        });
        if (res.ok) toast.success('Starred');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedEmail, fetchEmails]);

  const filtered =
    filter === 'ALL' ? emails : emails.filter(e => e.priority === filter);

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="animate-pulse flex items-center p-4 bg-[#FFEE58] rounded-xl gap-4"
          >
            <div className="w-10 h-10 bg-[#FBC02D] rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#FBC02D] rounded w-1/4" />
              <div className="h-3 bg-[#FBC02D] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex h-full ${selectedEmail ? '' : ''}`}>
      {/* Email List Panel */}
      <div
        className={`${
          selectedEmail ? 'w-1/2' : 'w-full'
        } flex flex-col border-r border-[#FBC02D] overflow-hidden`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#FBC02D] bg-[#FFF9C4] shrink-0">
          <div className="flex gap-1 bg-[#FFEE58] rounded-xl p-1">
            {(['ALL', 'URGENT', 'IMPORTANT'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-[#D32F2F] text-[#FFF9C4]'
                    : 'text-green-900 hover:text-red-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-green-800">
              {filtered.length} emails
            </span>
            <button
              onClick={fetchEmails}
              className="p-1.5 hover:bg-[#FFEE58] rounded-lg text-green-900 hover:text-red-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Email Items */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-green-800 gap-2">
              <div className="text-4xl">📭</div>
              <p className="text-sm">No emails in {folder}</p>
            </div>
          ) : (
            filtered.map(email => {
              const isTriaging = triaging.has(email.id);
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(isSelected ? null : email)}
                  className={`flex items-start p-4 cursor-pointer border-b border-[#FBC02D] transition-all group hover:bg-[#FFEE58] ${
                    isSelected
                      ? 'bg-[#FFEE58] border-l-2 border-l-[#D32F2F]'
                      : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#FBC02D] border border-[#F9A825] flex items-center justify-center font-bold text-sm text-[#D32F2F] shrink-0 mr-3">
                    {(email.data?.from || 'U').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-semibold text-red-800 text-sm truncate">
                        {email.data?.from || 'Unknown'}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {isTriaging ? (
                          <span className="text-xs text-green-700 animate-pulse">
                            Analyzing…
                          </span>
                        ) : email.priority ? (
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${
                              PRIORITY_COLORS[email.priority] || ''
                            }`}
                          >
                            {email.priority}
                          </span>
                        ) : null}
                        <span className="text-xs text-green-800">
                          {email.data?.date
                            ? new Date(email.data.date).toLocaleDateString(
                                undefined,
                                { month: 'short', day: 'numeric' }
                              )
                            : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-red-700 font-medium truncate">
                      {email.data?.subject || '(no subject)'}
                    </div>
                    <div className="text-xs text-green-800 truncate mt-0.5">
                      {email.data?.body || ''}
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="hidden group-hover:flex items-center gap-1 ml-2 shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        fetch('/api/gmail/action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: email.id,
                            action: 'archive',
                          }),
                        }).then(() => {
                          toast.success('Archived');
                          fetchEmails();
                        });
                      }}
                      className="p-1 hover:bg-[#FFF9C4] rounded text-green-800 hover:text-red-800"
                      title="Archive"
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        fetch('/api/gmail/action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: email.id,
                            action: 'trash',
                          }),
                        }).then(() => {
                          toast.success('Trashed');
                          fetchEmails();
                        });
                      }}
                      className="p-1 hover:bg-[#FFF9C4] rounded text-green-800 hover:text-red-400"
                      title="Trash"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        fetch('/api/gmail/action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: email.id,
                            action: 'star',
                          }),
                        }).then(() => toast.success('Starred'));
                      }}
                      className="p-1 hover:bg-[#FFF9C4] rounded text-green-800 hover:text-[#D32F2F]"
                      title="Star"
                    >
                      <Star size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Email Detail Pane */}
      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onRefresh={fetchEmails}
        />
      )}
    </div>
  );
}
