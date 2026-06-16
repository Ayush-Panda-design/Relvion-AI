'use client';

import { useState, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AgentPanel } from '@/components/agent/AgentPanel';
import { ComposeModal } from '@/components/email/ComposeModal';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { DensityProvider } from '@/components/dashboard/DensityProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { emailShortcutsRef } from '@/lib/email-shortcuts-ref';
import { useWorkspaceNav } from '@/contexts/workspace-nav';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { activeFolder, navigateFolder, routerReady } = useWorkspaceNav();
  const [showCompose, setShowCompose] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    enabled: routerReady && !showCompose,
    onCompose: () => setShowCompose(true),
    onFolderChange: navigateFolder,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onNavigateSettings: () => navigateFolder('settings'),
    onNavigateAnalytics: () => navigateFolder('analytics'),
    emailShortcutsRef,
  });

  return (
    <div className={cn('flex h-screen w-full overflow-hidden font-sans', dash.bg, dash.text)}>
      <Sidebar
        activeFolder={activeFolder}
        onFolderChange={navigateFolder}
        onComposeClick={() => setShowCompose(true)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar searchInputRef={searchInputRef} />
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </div>
      <AgentPanel />
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
      <CommandPalette onFolderChange={navigateFolder} onComposeClick={() => setShowCompose(true)} />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DensityProvider>
      <AppShellInner>{children}</AppShellInner>
    </DensityProvider>
  );
}
