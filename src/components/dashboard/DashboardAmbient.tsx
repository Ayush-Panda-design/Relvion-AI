'use client';

import { useTheme } from '@/components/dashboard/ThemeProvider';

/** Theme-aware ambient background — warm mesh for Crextio, flat elsewhere. */
export function DashboardAmbient() {
  const { theme } = useTheme();

  if (theme !== 'crextio') return null;

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
