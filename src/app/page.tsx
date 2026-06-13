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
