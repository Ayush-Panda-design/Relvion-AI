'use client';

import type { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

/** Shared Radix/shadcn providers for dashboard workspace routes. */
export function WorkspaceProviders({ children }: { children: ReactNode }) {
  return <TooltipProvider delayDuration={280}>{children}</TooltipProvider>;
}
