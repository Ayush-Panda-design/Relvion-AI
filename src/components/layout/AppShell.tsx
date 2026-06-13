'use client';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AgentPanel } from '@/components/agent/AgentPanel';
import { ComposeModal } from '@/components/email/ComposeModal';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { useRouter } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const router = useRouter();

  const handleFolderChange = (folder: string) => {
    setActiveFolder(folder);
    if (folder === 'calendar') router.push('/');
    else router.push('/');
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0f1e] overflow-hidden text-slate-100 font-sans">
      <Sidebar activeFolder={activeFolder} onFolderChange={handleFolderChange} onComposeClick={() => setShowCompose(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <AgentPanel />
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
      <CommandPalette onFolderChange={handleFolderChange} onComposeClick={() => setShowCompose(true)} />
    </div>
  );
}
