'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { AgentPanel } from '@/components/agent/AgentPanel';
import { EmailList } from '@/components/email/EmailList';
import { CalendarView } from '@/components/calendar/CalendarView';
import { useState } from 'react';

export default function Home() {
  const [activeFolder, setActiveFolder] = useState('inbox');

  return (
    <div className="flex h-screen w-full bg-[#0a0f1e] overflow-hidden text-slate-100 font-sans">
      <Sidebar activeFolder={activeFolder} onFolderChange={setActiveFolder} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto relative">
          {activeFolder === 'calendar' ? <CalendarView /> : <EmailList folder={activeFolder} />}
        </main>
      </div>

      <AgentPanel />
    </div>
  );
}
