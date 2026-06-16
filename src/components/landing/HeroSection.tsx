'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calendar,
  Mail,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';
import { primaryButton, secondaryButton, googleHeadlineAccent } from './theme';
import { LandingIllustration } from './illustrations/LandingIllustration';

const TRUST_LOGOS = [
  { name: 'Gmail', color: '#EA4335' },
  { name: 'Google Calendar', color: '#4285F4' },
  { name: 'Gemini', color: '#34A853' },
  { name: 'OAuth 2.0', color: '#FBBC04' },
];

const HERO_STATS = [
  { value: '3', label: 'Surfaces unified', color: '#4285F4' },
  { value: '⌘K', label: 'Command palette', color: '#34A853' },
  { value: 'AI', label: 'In-thread agent', color: '#EA4335' },
];

const FLOATING_CHIPS = [
  { icon: Mail, label: 'Smart triage', color: '#EA4335', className: '-left-2 top-[18%] sm:-left-8' },
  { icon: Calendar, label: 'Schedule in-thread', color: '#4285F4', className: '-right-2 top-[28%] sm:-right-10' },
  { icon: Bot, label: 'Relvion Agent', color: '#34A853', className: 'bottom-[12%] left-1/2 -translate-x-1/2' },
];

export function HeroSection({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section className="relative overflow-hidden bg-white pb-12 pt-4 md:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(#E8EAED 1px, transparent 1px), linear-gradient(90deg, #E8EAED 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#E8F0FE] blur-3xl" />
        <div className="absolute -right-16 top-32 h-64 w-64 rounded-full bg-[#E6F4EA] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-56 w-[min(100%,800px)] -translate-x-1/2 rounded-full bg-[#FEF7E0] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pt-8 lg:grid-cols-2 lg:gap-16 lg:pt-12">
        <div>
          <BlurFade delay={0.05}>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#DADCE0] bg-white px-4 py-1.5 text-xs font-medium text-[#5F6368] shadow-sm">
              <motion.span
                className="flex h-2 w-2 rounded-full bg-[#34A853]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="flex gap-0.5">
                <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
                <span className="h-2 w-2 rounded-full bg-[#34A853]" />
                <span className="h-2 w-2 rounded-full bg-[#FBBC04]" />
                <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
              </span>
              Early access · AI email workspace
            </p>
          </BlurFade>

          <BlurFade delay={0.12}>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-[#202124] sm:text-5xl lg:text-[3.1rem]">
              Inbox, calendar &amp; AI for{' '}
              <span className={googleHeadlineAccent('blue')}>faster</span>{' '}
              <span className={googleHeadlineAccent('green')}>team</span>{' '}
              <span className={googleHeadlineAccent('red')}>workflow</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.22}>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#5F6368] md:text-lg">
              Relvion unifies Gmail, Google Calendar, and an embedded agent — triage threads, draft replies,
              and schedule meetings without leaving the conversation.
            </p>
          </BlurFade>

          <BlurFade delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3">
              {HERO_STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className="rounded-2xl border border-[#E8EAED] bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-lg font-bold" style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className="text-[11px] font-medium text-[#5F6368]">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </BlurFade>

          <BlurFade delay={0.38}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href={ctaHref} className={cn(primaryButton(), 'gap-2.5 px-8')}>
                  {ctaLabel}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
              <Link href="#demo" className={secondaryButton()}>
                See live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.15} className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#E8EAED] bg-gradient-to-br from-[#E8F0FE] via-white to-[#E6F4EA] p-3 shadow-xl">
            <BorderBeam size={280} duration={14} colorFrom="#4285F4" colorTo="#34A853" />
            <div className="relative">
              <LandingIllustration
                id="hero"
                isDark={false}
                frame={false}
                float={false}
                interactive
                priority
              />
              {FLOATING_CHIPS.map((chip, i) => (
                <motion.div
                  key={chip.label}
                  className={cn(
                    'absolute z-20 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm',
                    chip.className
                  )}
                  animate={{ y: [0, i % 2 === 0 ? -6 : 6, 0] }}
                  transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: chip.color }}
                  >
                    <chip.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold text-[#202124]">{chip.label}</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#34A853] shadow-sm"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="h-3 w-3" />
              Live sync
            </motion.div>
          </div>
        </BlurFade>
      </div>

      <div className="relative z-10 mx-auto mt-14 max-w-5xl border-t border-[#E8EAED] px-6 pt-10">
        <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-[#80868B]">
          Built on the stack you already trust
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {TRUST_LOGOS.map((item, i) => (
            <motion.span
              key={item.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2 text-sm font-semibold tracking-tight"
              style={{ color: item.color }}
            >
              <Sparkles className="h-3.5 w-3.5 opacity-60" />
              {item.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
