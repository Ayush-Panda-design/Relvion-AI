'use client';
import { Mail, Calendar, Settings, BarChart2, Inbox, Send, Archive, Trash, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Sidebar({
  activeFolder,
  onFolderChange,
  onComposeClick,
}: {
  activeFolder: string;
  onFolderChange: (f: string) => void;
  onComposeClick?: () => void;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<{ email: string; name: string } | null>(null);

  // Fetch live counts for the sidebar badges
  useEffect(() => {
    fetch('/api/gmail/counts')
      .then(r => r.json())
      .then(setCounts)
      .catch(() => {});
  }, []);

  // Fetch user profile for the bottom section
  useEffect(() => {
    fetch('/api/gmail/profile')
      .then(r => r.json())
      .then(data => {
        if (data.email) {
          setProfile({
            email: data.email,
            name: data.email.split('@')[0], // Fallback name
          });
        }
      })
      .catch(() => {});
  }, []);

  const folders = [
    { name: 'inbox', label: 'Inbox', icon: Inbox, count: counts.inbox || 0 },
    { name: 'drafts', label: 'Drafts', icon: FileText, count: counts.drafts || 0 },
    { name: 'sent', label: 'Sent', icon: Send, count: counts.sent || 0 },
    { name: 'spam', label: 'Spam', icon: Archive, count: counts.spam || 0 },
    { name: 'trash', label: 'Trash', icon: Trash, count: counts.trash || 0 },
  ];

  return (
    <aside className="w-[220px] bg-[#0d1425] border-r border-[#1e293b] flex flex-col h-screen">
      <div className="p-4 flex items-center gap-2">
        <div className="text-[#c9a84c]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <h1 className="font-bold text-lg text-slate-100 tracking-tight">Relvion AI</h1>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={() => {
            if (onComposeClick) onComposeClick();
          }}
          className="w-full bg-[#c9a84c] hover:bg-[#d4b55c] text-[#0a0f1e] font-semibold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:shadow-[0_0_25px_rgba(201,168,76,0.5)] flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none mb-0.5">+</span> Compose
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Mail
          </h2>
          <div className="space-y-0.5">
            {folders.map(f => (
              <button
                key={f.name}
                onClick={() => onFolderChange(f.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  activeFolder === f.name
                    ? 'bg-[#1a2235] text-slate-100 shadow-[0_0_10px_rgba(201,168,76,0.1)]'
                    : 'text-slate-400 hover:bg-[#1a2235] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <f.icon size={18} className={activeFolder === f.name ? 'text-[#c9a84c]' : ''} />
                  <span className="text-sm font-medium">{f.label}</span>
                </div>
                {f.count > 0 && (
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      f.name === 'inbox' ? 'bg-[#c9a84c] text-[#0a0f1e]' : 'bg-[#1e293b]'
                    }`}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Calendar
          </h2>
          <div className="space-y-0.5">
            <button
              onClick={() => onFolderChange('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                activeFolder === 'calendar'
                  ? 'bg-[#1a2235] text-slate-100 shadow-[0_0_10px_rgba(201,168,76,0.1)]'
                  : 'text-slate-400 hover:bg-[#1a2235] hover:text-slate-200'
              }`}
            >
              <Calendar size={18} className={activeFolder === 'calendar' ? 'text-[#c9a84c]' : ''} />
              <span className="text-sm font-medium">Calendar</span>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Other
          </h2>
          <div className="space-y-0.5">
            <Link
              href="/analytics"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-[#1a2235] hover:text-slate-200 transition-all"
            >
              <BarChart2 size={18} />
              <span className="text-sm font-medium">Analytics</span>
            </Link>
            <Link
              href="/settings"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-[#1a2235] hover:text-slate-200 transition-all"
            >
              <Settings size={18} />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a2235] flex items-center justify-center font-semibold text-sm border border-[#c9a84c] uppercase">
            {profile?.name ? profile.name.charAt(0) : 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-200 truncate">
              {profile?.name || 'User'}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {profile?.email || 'user@example.com'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
