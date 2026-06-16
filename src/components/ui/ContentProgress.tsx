'use client';

import { cn } from '@/lib/utils';

/** Gradient top progress bar — instant feedback while content loads. */
export function ContentProgress({ active, className }: { active: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] overflow-hidden transition-opacity duration-300',
        active ? 'opacity-100' : 'opacity-0',
        className
      )}
      aria-hidden={!active}
    >
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-[#0D9488]/10 dark:bg-[#8ab4f8]/10" />
        <div
          className={cn(
            'h-full w-full origin-left animate-[contentProgress_1.2s_ease-in-out_infinite]',
            'bg-gradient-to-r from-[#0D9488] via-[#059669] to-[#EA580C]',
            'dark:from-[#8ab4f8] dark:via-[#34d399] dark:to-[#8ab4f8]',
            'shadow-[0_0_12px_rgba(13,148,136,0.35)] dark:shadow-[0_0_12px_rgba(138,180,248,0.25)]'
          )}
        />
      </div>
    </div>
  );
}
