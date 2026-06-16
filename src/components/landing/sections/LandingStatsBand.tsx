'use client';

import { motion } from 'framer-motion';
import { BlurFade } from '@/components/ui/blur-fade';
import { NumberTicker } from '@/components/ui/number-ticker';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { cn } from '@/lib/utils';

const STATS = [
  { value: 3, suffix: '', label: 'Apps unified', hint: 'Inbox, calendar & agent in one tab' },
  { value: 47, suffix: '%', label: 'Less tab switching', hint: 'Measured in early-access sessions' },
  { value: 12, suffix: '×', label: 'Faster triage', hint: 'Priority threads surfaced first' },
  { value: 1, suffix: '', label: 'Command palette', hint: '⌘K to reach every action' },
];

export function LandingStatsBand() {
  return (
    <section className="relative border-y border-[#E8EAED] bg-[#FAFBFC] py-14">
      <div className="mx-auto max-w-6xl px-6">
        <BlurFade>
          <p className="text-center text-sm leading-relaxed text-[#5F6368]">
            <AnimatedShinyText className="font-medium text-[#3C4043]">
              Relvion keeps your Gmail and Calendar where they are
            </AnimatedShinyText>
            {' — and adds an AI layer that actually lives inside your workflow, not beside it.'}
          </p>
        </BlurFade>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <BlurFade key={s.label} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-[#E8EAED] bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className={cn('text-3xl font-bold text-[#1a73e8]')}>
                  <NumberTicker value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-sm font-semibold text-[#202124]">{s.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#80868B]">{s.hint}</p>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
