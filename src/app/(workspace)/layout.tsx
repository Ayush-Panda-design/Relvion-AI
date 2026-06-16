'use client';

import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { WorkspaceNavProvider } from '@/contexts/workspace-nav';
import { WorkspaceProviders } from '@/components/providers/WorkspaceProviders';
import { PageLoader } from '@/components/dashboard/loading/DashboardLoaders';

function WorkspaceFallback() {
  return <PageLoader />;
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<WorkspaceFallback />}>
      <WorkspaceNavProvider>
        <WorkspaceProviders>
          <div className="flex h-screen min-h-0 flex-col overflow-hidden">
            <AppShell>{children}</AppShell>
          </div>
        </WorkspaceProviders>
      </WorkspaceNavProvider>
    </Suspense>
  );
}
