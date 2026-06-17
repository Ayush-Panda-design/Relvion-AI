'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type WorkspaceShellContextValue = {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  agentOpen: boolean;
  openAgent: () => void;
  closeAgent: () => void;
  toggleAgent: () => void;
};

const WorkspaceShellContext = createContext<WorkspaceShellContextValue | null>(null);

export function WorkspaceShellProvider({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openAgent = useCallback(() => setAgentOpen(true), []);
  const closeAgent = useCallback(() => setAgentOpen(false), []);
  const toggleAgent = useCallback(() => setAgentOpen((v) => !v), []);

  return (
    <WorkspaceShellContext.Provider
      value={{
        mobileNavOpen,
        openMobileNav,
        closeMobileNav,
        agentOpen,
        openAgent,
        closeAgent,
        toggleAgent,
      }}
    >
      {children}
    </WorkspaceShellContext.Provider>
  );
}

export function useWorkspaceShell() {
  const ctx = useContext(WorkspaceShellContext);
  if (!ctx) {
    throw new Error('useWorkspaceShell must be used within WorkspaceShellProvider');
  }
  return ctx;
}
