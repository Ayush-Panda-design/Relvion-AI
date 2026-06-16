'use client';

import { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { landingSectionBg, type LandingTone } from './theme';

const LandingToneContext = createContext<{ tone: LandingTone; isDark: boolean }>({
  tone: 'dark',
  isDark: true,
});

export function useLandingSection() {
  return useContext(LandingToneContext);
}

export function LandingSection({
  tone,
  id,
  className,
  innerClassName,
  borderY,
  children,
}: {
  tone: LandingTone;
  id?: string;
  className?: string;
  innerClassName?: string;
  borderY?: boolean;
  children: React.ReactNode;
}) {
  const isDark = tone === 'dark';
  return (
    <LandingToneContext.Provider value={{ tone, isDark }}>
      <section
        id={id}
        className={cn(
          landingSectionBg(tone),
          borderY && (isDark ? 'border-y border-white/[0.06]' : 'border-y border-stone-300/40'),
          className
        )}
      >
        <div className={cn('relative z-10', innerClassName)}>{children}</div>
      </section>
    </LandingToneContext.Provider>
  );
}

/** Use inside LandingSection for tone-aware text/surfaces */
export function Ls({ children }: { children: (ctx: { tone: LandingTone; isDark: boolean }) => React.ReactNode }) {
  const ctx = useLandingSection();
  return <>{children(ctx)}</>;
}
