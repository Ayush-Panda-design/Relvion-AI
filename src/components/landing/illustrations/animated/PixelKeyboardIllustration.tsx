'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const KEYS = [
  ['⌘', 'K', 'G', 'C'],
  ['1', '2', '3', '↵'],
];

/** Pixel-grid keyboard — key press ripple animation */
export function PixelKeyboardIllustration({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-square w-full overflow-hidden rounded-2xl bg-[#1a1a2e]', className)}>
      <svg viewBox="0 0 320 240" className="h-full w-full p-8" aria-hidden>
        {KEYS.map((row, ri) =>
          row.map((key, ci) => {
            const x = 40 + ci * 68;
            const y = 50 + ri * 72;
            return (
              <motion.g key={`${ri}-${ci}`}>
                <motion.rect
                  x={x}
                  y={y}
                  width="56"
                  height="56"
                  rx="10"
                  fill="#2d2d44"
                  stroke="#4285F4"
                  strokeWidth="2"
                  animate={{
                    fill: ci === 1 && ri === 0 ? ['#2d2d44', '#4285F4', '#2d2d44'] : '#2d2d44',
                    scale: ci === 1 && ri === 0 ? [1, 0.95, 1] : 1,
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  style={{ transformOrigin: `${x + 28}px ${y + 28}px` }}
                />
                <text x={x + 28} y={y + 34} textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700">
                  {key}
                </text>
              </motion.g>
            );
          })
        )}

        <motion.path
          d="M40 180 H280"
          stroke="#34A853"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="8 12"
          animate={{ strokeDashoffset: [0, -40] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={80 + i * 80}
            cy={200}
            r="4"
            fill={['#FBBC04', '#EA4335', '#34A853'][i]}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}
