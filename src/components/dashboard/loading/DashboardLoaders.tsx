'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { Shimmer } from './Shimmer';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const rowFade = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

/** Full-screen workspace boot loader */
export function PageLoader({ label = 'Loading workspace…' }: { label?: string }) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col items-center justify-center gap-5', dash.bg)}>
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-[orbitSpin_2.4s_linear_infinite] rounded-full border-2 border-transparent border-t-[#0D9488] border-r-[#059669] dark:border-t-[#8ab4f8] dark:border-r-[#34d399]" />
        <span className="absolute inset-1.5 animate-[orbitSpin_1.6s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-[#EA580C]/70 border-l-[#0D9488]/50 dark:border-b-[#fb923c]/70 dark:border-l-[#8ab4f8]/50" />
        <span className={cn('relative h-3 w-3 rounded-full', dash.accentBg)} />
      </div>
      <p className={cn('text-sm font-medium tracking-wide', dash.textMuted)}>{label}</p>
    </div>
  );
}

/** Agent / async thinking indicator */
export function ThinkingLoader({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn('h-1.5 w-1.5 rounded-full', dash.accentBg)}
          style={{
            animation: 'thinkingWave 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}

/** Inbox / mail folder initial load */
export function EmailListLoader() {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', dash.bg)}>
      <div className={cn('flex shrink-0 items-center gap-3 px-4 py-2.5', dash.glassToolbar)}>
        <Shimmer className="h-8 w-48" rounded="lg" />
        <div className="ml-auto flex gap-2">
          <Shimmer className="h-8 w-20" rounded="full" />
          <Shimmer className="h-8 w-8" rounded="full" />
        </div>
      </div>
      <motion.div
        className="flex-1 space-y-0.5 px-2 py-2"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            variants={rowFade}
            className={cn(
              'flex items-center gap-3 rounded-xl border-b px-4 py-3.5',
              dash.border,
              'bg-[#EBEAE5]/50 dark:bg-[#292a2d]/40'
            )}
          >
            <Shimmer className="h-10 w-10 shrink-0" rounded="full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex gap-2">
                <Shimmer className="h-3 w-28" />
                <Shimmer className="ml-auto h-3 w-10" />
              </div>
              <Shimmer className="h-3 w-3/4 max-w-[280px]" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/** Calendar sidebar upcoming events skeleton */
export function CalendarEventsLoader({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 px-1">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07, duration: 0.3 }}
          className={cn('rounded-xl border p-3', dash.elevated, dash.border)}
        >
          <Shimmer className="mb-2 h-3.5 w-2/3" />
          <Shimmer className="h-2.5 w-1/3" />
        </motion.div>
      ))}
    </div>
  );
}

/** Calendar month grid skeleton */
export function CalendarGridLoader() {
  return (
    <div className="grid grid-cols-7 gap-2 p-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <Shimmer
          key={i}
          className="min-h-[88px]"
          rounded="xl"
        />
      ))}
    </div>
  );
}

/** Analytics dashboard skeleton */
export function AnalyticsLoader() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Shimmer className="h-8 w-40" rounded="lg" />
          <Shimmer className="h-4 w-64" />
        </div>
        <Shimmer className="h-10 w-28" rounded="full" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={cn('rounded-2xl border p-5', dash.elevated, dash.border)}
          >
            <div className="mb-4 flex justify-between">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-5 w-5" rounded="md" />
            </div>
            <Shimmer className="mb-2 h-9 w-20" />
            <Shimmer className="h-3 w-32" />
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className={cn('rounded-2xl border p-5', dash.elevated, dash.border)}>
            <Shimmer className="mb-4 h-5 w-40" />
            <div className="space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j}>
                  <div className="mb-1 flex justify-between">
                    <Shimmer className="h-3 w-16" />
                    <Shimmer className="h-3 w-8" />
                  </div>
                  <Shimmer className="h-2 w-full" rounded="full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={cn('rounded-2xl border p-5', dash.elevated, dash.border)}>
        <Shimmer className="mb-4 h-5 w-36" />
        <div className="flex h-32 items-end gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-end" style={{ height: '100%' }}>
              <Shimmer
                className="w-full"
                rounded="md"
                style={{ height: `${32 + (i % 3) * 20}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Settings profile cards skeleton */
export function SettingsLoader() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <Shimmer className="h-8 w-32" rounded="lg" />
      {[0, 1, 2].map((i) => (
        <div key={i} className={cn('rounded-2xl border p-6', dash.elevated, dash.border)}>
          <Shimmer className="mb-4 h-5 w-40" />
          <Shimmer className="h-20 w-full" rounded="xl" />
        </div>
      ))}
    </div>
  );
}
