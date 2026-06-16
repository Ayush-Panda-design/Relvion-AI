'use client';

import { cn } from '@/lib/utils';

/** Thin top progress bar — instant feedback while content loads in background. */
export function ContentProgress({ active, className }: { active: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden transition-opacity duration-200',
        active ? 'opacity-100' : 'opacity-0',
        className
      )}
      aria-hidden={!active}
    >
      <div className="h-full w-full origin-left animate-[contentProgress_1.2s_ease-in-out_infinite] bg-[#8ab4f8]" />
    </div>
  );
}
