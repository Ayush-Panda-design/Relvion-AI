'use client';

import { useTheme } from '@/components/dashboard/ThemeProvider';

/** Theme-aware ambient background — subtle glow per theme. */
export function DashboardAmbient() {
  const { theme } = useTheme();

  if (theme === 'midnight' || theme === 'pulse' || theme === 'ocean') return null;

  if (theme === 'crextio') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="animate-aurora-1 absolute -left-[10%] -top-[20%] h-[55%] w-[55%] rounded-full blur-3xl"
          style={{ background: 'var(--dash-ambient-1)' }}
        />
        <div
          className="animate-aurora-2 absolute -bottom-[15%] -right-[5%] h-[50%] w-[50%] rounded-full blur-3xl"
          style={{ background: 'var(--dash-ambient-2)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(254,243,199,0.5), transparent 70%)',
          }}
        />
      </div>
    );
  }

  if (theme === 'oxfin') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -right-[8%] top-[5%] h-[40%] w-[40%] rounded-full blur-3xl"
          style={{ background: 'var(--dash-ambient-1)' }}
        />
        <div
          className="absolute -bottom-[10%] -left-[5%] h-[35%] w-[35%] rounded-full blur-3xl"
          style={{ background: 'var(--dash-ambient-2)' }}
        />
      </div>
    );
  }

  if (theme === 'limedock') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -left-[5%] top-[10%] h-[45%] w-[45%] rounded-full blur-3xl"
          style={{ background: 'var(--dash-ambient-1)' }}
        />
        <div
          className="absolute bottom-[5%] right-[10%] h-[30%] w-[30%] rounded-full blur-3xl"
          style={{ background: 'var(--dash-ambient-2)' }}
        />
      </div>
    );
  }

  return null;
}
