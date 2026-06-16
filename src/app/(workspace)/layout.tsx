'use client';

import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { WorkspaceNavProvider } from '@/contexts/workspace-nav';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

function WorkspaceFallback() {
  return <div className={cn('h-screen w-full', dash.bg)} />;
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<WorkspaceFallback />}>
      <WorkspaceNavProvider>
        <AppShell>{children}</AppShell>
      </WorkspaceNavProvider>
    </Suspense>
  );
}
