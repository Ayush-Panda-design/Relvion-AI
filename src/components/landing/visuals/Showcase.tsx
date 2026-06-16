'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam';
import {
  featureIllustrationMap,
  LANDING_ILLUSTRATIONS,
  type LandingIllustrationId,
} from '@/lib/landing-illustrations';
import {
  LandingIllustration,
  LandingIllustrationBadge,
} from '@/components/landing/illustrations/LandingIllustration';
import { LandingSceneImage } from '@/components/landing/illustrations/LandingSceneImage';

const showcaseMeta: { id: LandingIllustrationId; tag: string; caption: string }[] = [
  { id: 'inbox', tag: 'Inbox', caption: 'Unified inbox view' },
  { id: 'calendar', tag: 'Calendar', caption: 'Calendar beside your mail' },
  { id: 'agent', tag: 'Agent', caption: 'Agent-powered actions' },
  { id: 'analytics', tag: 'Analytics', caption: 'Communication analytics' },
];

const THUMB_RING = [
  'ring-[#34A853]',
  'ring-[#4285F4]',
  'ring-[#FBBC04]',
  'ring-[#EA4335]',
];

export function ImageShowcase({
  isDark: _isDark,
  activeIndex,
  onSelect,
}: {
  isDark: boolean;
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const active = showcaseMeta[activeIndex] ?? showcaseMeta[0];

  return (
    <div className="flex flex-col gap-6">
      <LandingSceneImage id="flow-showcase" className="shadow-md ring-1 ring-[#E8EAED]" />

      <div className="flex flex-col gap-6 lg:flex-row">
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-[#E8EAED] bg-white shadow-sm">
        <BorderBeam size={200} duration={10} colorFrom="#4285F4" colorTo="#34A853" />
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-white"
        >
          <LandingIllustration id={active.id} isDark={false} frame={false} float={false} interactive />
          <div className="absolute inset-x-0 bottom-0 border-t border-[#E8EAED] bg-gradient-to-t from-white via-white/95 to-transparent px-6 py-5">
            <LandingIllustrationBadge label={active.tag} isDark={false} />
            <p className="mt-2 text-lg font-semibold text-[#202124]">{active.caption}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-row gap-3 overflow-x-auto lg:w-52 lg:flex-col">
        {showcaseMeta.map((item, i) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onSelect(i)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            animate={activeIndex === i ? { scale: [1, 1.02, 1] } : {}}
            transition={activeIndex === i ? { duration: 2, repeat: Infinity } : { type: 'spring', stiffness: 400 }}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-2xl border transition-all lg:w-full',
              activeIndex === i
                ? cn('border-[#1a73e8] ring-2', THUMB_RING[i])
                : 'border-[#E8EAED] opacity-80 hover:opacity-100'
            )}
          >
            <div className="h-20 w-28 lg:h-24 lg:w-full">
              <LandingIllustration id={item.id} isDark={false} frame={false} float={false} interactive compact className="h-full" />
            </div>
            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#5F6368]">
              {item.tag}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
    </div>
  );
}

export function FeatureImage({
  eyebrow,
  isDark: _isDark,
}: {
  eyebrow: string;
  isDark: boolean;
}) {
  const illoId = featureIllustrationMap[eyebrow] ?? 'inbox';
  const meta = LANDING_ILLUSTRATIONS[illoId];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E8EAED] bg-white shadow-sm">
      <LandingIllustration id={illoId} isDark={false} frame={false} float={false} interactive />
      <p className="border-t border-[#E8EAED] px-4 py-3 font-mono text-xs text-[#80868B]">
        relvion / {meta.alt.toLowerCase().replace(/\s+/g, '-')}
      </p>
    </div>
  );
}

export function DayInLifeDiagram({ isDark: _isDark }: { isDark: boolean }) {
  const hours = [
    { time: '8:00', label: 'Agent summary', desc: 'Overnight digest + priorities', color: '#4285F4' },
    { time: '9:30', label: 'Triage inbox', desc: 'Archive noise, star urgent', color: '#34A853' },
    { time: '11:00', label: 'Draft replies', desc: 'Agent writes, you approve', color: '#FBBC04' },
    { time: '2:00', label: 'Schedule', desc: 'Thread → calendar event', color: '#EA4335' },
    { time: '5:00', label: 'Inbox zero', desc: 'Analytics review', color: '#4285F4' },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E8EAED] bg-white shadow-sm">
      <LandingIllustration id="productivity" isDark={false} frame={false} float={false} interactive className="border-b border-[#E8EAED]" />
      <div className="p-6">
        <p className="mb-6 text-sm font-semibold text-[#202124]">A day with Relvion</p>
        <div className="relative">
          <div className="absolute top-3 bottom-3 left-[52px] w-px bg-[#E8EAED]" />
          <div className="space-y-6">
            {hours.map((h, i) => (
              <motion.div
                key={h.time}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-4"
              >
                <span className="w-12 shrink-0 pt-0.5 text-right font-mono text-xs text-[#5F6368]">{h.time}</span>
                <div
                  className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 bg-white"
                  style={{ borderColor: h.color, backgroundColor: h.color }}
                />
                <div className="flex-1 rounded-xl border border-[#E8EAED] bg-[#F8F9FA] px-4 py-3">
                  <p className="text-sm font-semibold text-[#202124]">{h.label}</p>
                  <p className="text-xs text-[#5F6368]">{h.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
