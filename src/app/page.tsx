'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { AgentPanel } from '@/components/agent/AgentPanel';
import { EmailList } from '@/components/email/EmailList';
import { CalendarView } from '@/components/calendar/CalendarView';
import { ComposeModal } from '@/components/email/ComposeModal';
import { CommandPalette } from '@/components/ui/CommandPalette';

export default function Home() {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [needsGoogle, setNeedsGoogle] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if Google is connected
  useEffect(() => {
    fetch('/api/gmail/profile')
      .then(res => res.json())
      .then(data => {
        if (!data.email || data.error) {
          setNeedsGoogle(true);
        }
      })
      .catch(() => setNeedsGoogle(true))
      .finally(() => setChecking(false));
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // c = compose
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) { setShowCompose(true); return; }
      // g + i/c/s navigation
      if (e.key === 'g') {
        const next = (k: KeyboardEvent) => {
          if (k.key === 'i') setActiveFolder('inbox');
          if (k.key === 'c') setActiveFolder('calendar');
          if (k.key === 's') setActiveFolder('sent');
          if (k.key === 'd') setActiveFolder('drafts');
          if (k.key === 't') setActiveFolder('trash');
          window.removeEventListener('keydown', next);
        };
        window.addEventListener('keydown', next);
        setTimeout(() => window.removeEventListener('keydown', next), 1000);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (checking) {
    return <div className="h-screen bg-[#FFF9C4] flex items-center justify-center font-semibold text-red-900">Loading your inbox...</div>;
  }

  if (needsGoogle) {
    return (
      <div className="flex h-screen w-full bg-[#FFF9C4] overflow-hidden items-center justify-center relative">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#FFEE58]/40 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#FBC02D]/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 w-full max-w-md px-6 bg-[#FFFDE7] border border-[#FBC02D] rounded-3xl shadow-[0_20px_60px_rgba(251,192,45,0.3)] p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Connect Google</h2>
          <p className="text-green-800 text-sm mb-8">
            Relvion AI requires access to your Gmail and Calendar to function.
          </p>
          <a
            href="/api/auth/google/start"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-white hover:bg-gray-50 border border-[#FBC02D] rounded-2xl font-semibold text-gray-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Connect Google Account
          </a>
          <form action="/api/auth/signout" method="POST" className="mt-6">
             <button type="submit" className="text-xs text-red-700 hover:underline">Sign out</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FFF9C4] overflow-hidden text-red-900 font-sans">
      <Sidebar
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        onComposeClick={() => setShowCompose(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onSearch={(q) => {/* handled in TopBar */}} />
        <main className="flex-1 overflow-hidden relative">
          {activeFolder === 'calendar' ? (
            <CalendarView />
          ) : (
            <EmailList folder={activeFolder} />
          )}
        </main>
      </div>

      <AgentPanel />

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}

      <CommandPalette
        onFolderChange={setActiveFolder}
        onComposeClick={() => setShowCompose(true)}
      />
    </div>
  );
}
