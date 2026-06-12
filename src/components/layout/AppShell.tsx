'use client';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AgentPanel } from '../agent/AgentPanel';
import { CommandPalette } from '../ui/CommandPalette';
import { ComposeModal } from '../email/ComposeModal';
import { useState } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#0a0f1e] overflow-hidden text-slate-100 font-sans">
      <Sidebar 
        activeFolder={activeFolder} 
        onFolderChange={setActiveFolder} 
        onComposeClick={() => setIsComposeOpen(true)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>

      <AgentPanel />
      <CommandPalette />
      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
    </div>
  );
}
