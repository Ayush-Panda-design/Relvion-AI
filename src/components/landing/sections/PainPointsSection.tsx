'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Layers, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';
import { LandingSceneImage } from '@/components/landing/illustrations/LandingSceneImage';
import { SectionFloatingOrbs } from '@/components/landing/motion/SectionFloatingOrbs';
import { landingSectionBg, landingText, sectionLabel } from '../theme';
import {
  BrandingStoryLine,
  BrandPromiseTypewriter,
  InteractivePriorityPeek,
} from '@/components/landing/motion/BrandingAnimations';

const METRICS = [
  { icon: Layers, value: '5+', label: 'Tabs eliminated', color: '#EA4335' },
  { icon: Clock, value: '1hr', label: 'Saved daily', color: '#4285F4' },
  { icon: Zap, value: '3×', label: 'Faster triage', color: '#34A853' },
];

type PainPoint = {
  problem: string;
  detail: string;
  solution: string;
};

export function PainPointsSection({ items }: { items: PainPoint[] }) {
  const tone = 'light' as const;

  return (
    <section className={cn('relative z-10 mx-auto max-w-6xl px-6 py-20', landingSectionBg('blue'))}>
      <SectionFloatingOrbs />
      <div className="relative grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <BlurFade>
            <p className={sectionLabel(tone)}>The problem</p>
            <h2
              className={cn(
                'mt-3 text-3xl font-bold tracking-tight sm:text-4xl',
                landingText(tone, 'primary')
              )}
            >
              Your tools weren&apos;t built for how you actually work.
            </h2>
            <p className={cn('mt-4 text-base', landingText(tone, 'muted'))}>
              Scattered apps create friction. Relvion replaces the tab chaos with one intelligent workspace.
            </p>
            <BrandingStoryLine variant="problem" />
            <div className="mt-5">
              <BrandPromiseTypewriter />
            </div>
          </BlurFade>

          <div className="mt-10 space-y-0">
            {items.map((item, i) => (
              <BlurFade key={item.problem} delay={i * 0.08}>
                <motion.div
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.45 }}
                  className="flex flex-col gap-4 border-t border-[#DADCE0]/60 py-8 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex max-w-sm items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FCE8E6]">
                      <X className="h-4 w-4 text-[#EA4335]" />
                    </span>
                    <div>
                      <h3 className={cn('font-semibold', landingText(tone, 'primary'))}>{item.problem}</h3>
                      <p className={cn('mt-1 text-sm', landingText(tone, 'muted'))}>{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex max-w-xs items-start gap-3 sm:text-right">
                    <p className={cn('text-sm leading-relaxed sm:order-1', landingText(tone, 'muted'))}>
                      {item.solution}
                    </p>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F4EA] sm:order-2">
                      <Check className="h-4 w-4 text-[#34A853]" />
                    </span>
                  </div>
                </motion.div>
              </BlurFade>
            ))}
          </div>
        </div>

        <BlurFade delay={0.12} className="relative lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#DADCE0] bg-white p-4 shadow-xl">
            <BorderBeam size={200} duration={12} colorFrom="#4285F4" colorTo="#FBBC04" />
            <LandingSceneImage id="unified-workspace" />

            <div className="mt-4">
              <InteractivePriorityPeek />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {METRICS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-2xl border border-[#E8EAED] bg-[#F8F9FA] p-3 text-center"
                >
                  <m.icon className="mx-auto h-4 w-4" style={{ color: m.color }} />
                  <p className="mt-1 text-lg font-bold text-[#202124]">{m.value}</p>
                  <p className="text-[10px] font-medium text-[#5F6368]">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
