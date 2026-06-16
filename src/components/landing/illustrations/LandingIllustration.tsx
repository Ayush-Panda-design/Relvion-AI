'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LANDING_ILLUSTRATIONS,
  type LandingIllustrationId,
} from '@/lib/landing-illustrations';

type FloatingBlob = {
  color: string;
  size: string;
  delay: number;
  dur: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

const FLOATING_BLOBS: FloatingBlob[] = [
  { color: '#E8F0FE', size: 'h-14 w-14', top: '8%', left: '-2%', delay: 0, dur: 4.2 },
  { color: '#E6F4EA', size: 'h-10 w-10', top: '20%', right: '0%', delay: 0.4, dur: 3.8 },
  { color: '#FEF7E0', size: 'h-12 w-12', bottom: '15%', left: '4%', delay: 0.8, dur: 5 },
  { color: '#FCE8E6', size: 'h-8 w-8', bottom: '25%', right: '6%', delay: 1.2, dur: 4.5 },
];

export function LandingIllustration({
  id,
  isDark: _isDark,
  className,
  frame = true,
  priority = false,
  float = true,
  compact = false,
  interactive = false,
}: {
  id: LandingIllustrationId;
  isDark: boolean;
  className?: string;
  frame?: boolean;
  priority?: boolean;
  float?: boolean;
  compact?: boolean;
  /** Floating blobs + hover lift */
  interactive?: boolean;
}) {
  const meta = LANDING_ILLUSTRATIONS[id];
  const aspect = compact
    ? 'h-full min-h-[5rem]'
    : meta.aspect === 'square'
      ? 'aspect-square'
      : meta.aspect === 'portrait'
        ? 'aspect-[3/4]'
        : id === 'hero'
          ? 'aspect-[5/3]'
          : 'aspect-[3/2]';

  const inner = (
    <motion.div
      whileHover={interactive ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn(
        'relative w-full overflow-hidden',
        aspect,
        frame && 'rounded-3xl border border-[#E8EAED] bg-white shadow-md',
        interactive && 'shadow-lg ring-1 ring-[#E8EAED]/80'
      )}
    >
      <motion.div
        className="absolute inset-0"
        animate={float ? { scale: [1, 1.03, 1] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src={meta.src}
          alt={meta.alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </motion.div>
      {interactive && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#4285F4]/5 via-transparent to-[#34A853]/5"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}
    </motion.div>
  );

  const wrapped = (
    <div className={cn('relative', className)}>
      {interactive &&
        FLOATING_BLOBS.map((b, i) => (
          <motion.span
            key={i}
            className={cn('pointer-events-none absolute rounded-2xl opacity-80', b.size)}
            style={{
              backgroundColor: b.color,
              top: b.top,
              left: b.left,
              right: b.right,
              bottom: b.bottom,
            }}
            animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }}
            transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeInOut' }}
          />
        ))}
      {inner}
    </div>
  );

  if (!float) {
    return wrapped;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {wrapped}
      </motion.div>
    </motion.div>
  );
}

const BADGE_COLORS: Record<string, string> = {
  Inbox: 'bg-[#E6F4EA] text-[#34A853]',
  Calendar: 'bg-[#E8F0FE] text-[#4285F4]',
  Agent: 'bg-[#FEF7E0] text-[#E37400]',
  Analytics: 'bg-[#FCE8E6] text-[#EA4335]',
};

export function LandingIllustrationBadge({
  label,
  isDark: _isDark,
}: {
  label: string;
  isDark: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider',
        BADGE_COLORS[label] ?? 'bg-[#E8F0FE] text-[#1a73e8]'
      )}
    >
      {label}
    </span>
  );
}
