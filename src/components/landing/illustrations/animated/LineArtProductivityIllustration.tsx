'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Line-art style with stroke-draw animation */
export function LineArtProductivityIllustration({ className }: { className?: string }) {
  const paths = [
    { d: 'M60 220 H180 V80 H60 Z', color: '#4285F4', delay: 0 },
    { d: 'M200 220 H340 V100 H200 Z', color: '#34A853', delay: 0.3 },
    { d: 'M360 220 H440 V140 H360 Z', color: '#FBBC04', delay: 0.6 },
    { d: 'M100 120 H160 V160 H100 Z', color: '#EA4335', delay: 0.9 },
  ];

  return (
    <div className={cn('relative aspect-square w-full overflow-hidden rounded-2xl bg-[#FAFAFA]', className)}>
      <svg viewBox="0 0 500 280" className="h-full w-full p-6" aria-hidden>
        {paths.map((p, i) => (
          <motion.rect
            key={i}
            x={p.d.includes('60 220') ? 60 : p.d.includes('200') ? 200 : p.d.includes('360') ? 360 : 100}
            y={p.d.includes('80') ? 80 : p.d.includes('100') ? 100 : p.d.includes('140') ? 140 : 120}
            width={p.d.includes('60 220') ? 120 : p.d.includes('200') ? 140 : p.d.includes('360') ? 80 : 60}
            height={p.d.includes('60 220') ? 140 : p.d.includes('200') ? 120 : p.d.includes('360') ? 80 : 40}
            fill="none"
            stroke={p.color}
            strokeWidth="3"
            rx="8"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: p.delay }}
          />
        ))}

        <motion.path
          d="M80 200 H160 M80 180 H140 M80 160 H150"
          stroke="#5F6368"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        <motion.circle
          cx="270"
          cy="160"
          r="35"
          fill="none"
          stroke="#34A853"
          strokeWidth="3"
          strokeDasharray="8 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '270px 160px' }}
        />

        <motion.path
          d="M255 160 L270 175 L290 145"
          stroke="#34A853"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', delay: 1.2 }}
          style={{ transformOrigin: '270px 160px' }}
        />

        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <circle cx="400" cy="70" r="20" fill="#E8F0FE" stroke="#4285F4" strokeWidth="2" />
          <path d="M392 70 H408 M400 62 V78" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
}
