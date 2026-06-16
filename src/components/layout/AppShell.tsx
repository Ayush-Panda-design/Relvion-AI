'use client';

import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AgentPanel } from '@/components/agent/AgentPanel';
import { ComposeModal } from '@/components/email/ComposeModal';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { DensityProvider } from '@/components/dashboard/DensityProvider';
import { ThemeProvider } from '@/components/dashboard/ThemeProvider';
import { KeyboardShortcutsDialog } from '@/components/dashboard/KeyboardShortcutsDialog';
import { DashboardAmbient } from '@/components/dashboard/DashboardAmbient';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { emailShortcutsRef } from '@/lib/email-shortcuts-ref';
import { useWorkspaceNav } from '@/contexts/workspace-nav';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { activeFolder, navigateFolder, routerReady } = useWorkspaceNav();
  const [showCompose, setShowCompose] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    enabled: routerReady && !showCompose && !showShortcuts,
    onCompose: () => setShowCompose(true),
    onFolderChange: navigateFolder,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onNavigateSettings: () => navigateFolder('settings'),
    onNavigateAnalytics: () => navigateFolder('analytics'),
    onShowShortcuts: () => setShowShortcuts(true),
    emailShortcutsRef,
  });

  return (
    <div className={cn('relative flex h-screen w-full overflow-hidden font-sans', dash.bodyBg, dash.text)}>
      <DashboardAmbient />

      <div className="relative z-10 flex h-full min-h-0 w-full">
        <Sidebar
          activeFolder={activeFolder}
          onFolderChange={navigateFolder}
          onComposeClick={() => setShowCompose(true)}
        />

        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', dash.workspaceShell)}>
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col border-l',
              dash.border,
              dash.mainPanel,
              dash.workspacePanel
            )}
          >
            <TopBar searchInputRef={searchInputRef} />
            <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
          </div>
        </div>

        <AgentPanel />
      </div>

      <AnimatePresence>
        {showCompose && <ComposeModal key="compose" onClose={() => setShowCompose(false)} />}
      </AnimatePresence>
      <CommandPalette
        onFolderChange={routerReady ? navigateFolder : undefined}
        onComposeClick={() => setShowCompose(true)}
      />
      <KeyboardShortcutsDialog open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DensityProvider>
        <AppShellInner>{children}</AppShellInner>
      </DensityProvider>
    </ThemeProvider>
  );
}
