'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Abstract gradient blobs — morphing AI agent visual */
export function GradientAgentIllustration({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#0f172a]', className)}>
      <motion.div
        className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-[#4285F4] blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-5 bottom-5 h-48 w-48 rounded-full bg-[#34A853] blur-3xl opacity-70"
        animate={{ x: [0, -25, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EA4335] blur-2xl opacity-50"
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <svg viewBox="0 0 400 300" className="relative z-10 h-full w-full" aria-hidden>
        <motion.ellipse
          cx="200"
          cy="150"
          rx="90"
          ry="70"
          fill="url(#agent-grad)"
          animate={{ rx: [90, 95, 90], ry: [70, 75, 70] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <defs>
          <linearGradient id="agent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285F4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#34A853" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FBBC04" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <motion.g
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ transformOrigin: '200px 150px' }}
        >
          <rect x="155" y="120" width="90" height="60" rx="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          {[0, 1, 2].map((i) => (
            <motion.rect
              key={i}
              x={165 + i * 28}
              y="175"
              width="22"
              height="4"
              rx="2"
              fill="#fff"
              opacity={0.6}
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <motion.circle
            cx="175"
            cy="140"
            r="5"
            fill="#fff"
            animate={{ scaleY: [1, 0.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.circle
            cx="225"
            cy="140"
            r="5"
            fill="#fff"
            animate={{ scaleY: [1, 0.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, delay: 0.1 }}
          />
        </motion.g>

        {[
          { x: 80, y: 80, c: '#FBBC04' },
          { x: 320, y: 90, c: '#EA4335' },
          { x: 310, y: 220, c: '#4285F4' },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r="8"
            fill={dot.c}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </svg>

      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center text-xs font-semibold tracking-widest text-white/70"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        RELVION AGENT
      </motion.div>
    </div>
  );
}
