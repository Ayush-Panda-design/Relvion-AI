'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Geometric duotone — rotating shield tiles */
export function GeometricSecurityIllustration({ className }: { className?: string }) {
  const tiles = [
    { x: 100, y: 80, size: 50, color: '#4285F4', delay: 0 },
    { x: 200, y: 60, size: 60, color: '#34A853', delay: 0.15 },
    { x: 300, y: 90, size: 45, color: '#FBBC04', delay: 0.3 },
    { x: 150, y: 160, size: 55, color: '#EA4335', delay: 0.45 },
    { x: 250, y: 170, size: 50, color: '#4285F4', delay: 0.6 },
  ];

  return (
    <div className={cn('relative aspect-square w-full overflow-hidden rounded-2xl bg-white', className)}>
      <svg viewBox="0 0 400 280" className="h-full w-full" aria-hidden>
        <motion.path
          d="M200 30 L320 90 V170 C320 220 200 260 200 260 C200 260 80 220 80 170 V90 Z"
          fill="#E6F4EA"
          stroke="#34A853"
          strokeWidth="3"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 120 }}
          style={{ transformOrigin: '200px 145px' }}
        />

        {tiles.map((t, i) => (
          <motion.rect
            key={i}
            x={t.x}
            y={t.y}
            width={t.size}
            height={t.size}
            rx="10"
            fill={t.color}
            opacity={0.85}
            initial={{ rotate: 0, scale: 0 }}
            whileInView={{ rotate: [0, 45, 0], scale: 1 }}
            viewport={{ once: true }}
            transition={{
              scale: { type: 'spring', delay: t.delay },
              rotate: { duration: 8, repeat: Infinity, delay: t.delay },
            }}
            style={{ transformOrigin: `${t.x + t.size / 2}px ${t.y + t.size / 2}px` }}
          />
        ))}

        <motion.path
          d="M175 145 L195 165 L230 125"
          stroke="#fff"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />

        <motion.circle
          cx="200"
          cy="145"
          r="55"
          fill="none"
          stroke="#34A853"
          strokeWidth="2"
          strokeDasharray="6 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '200px 145px' }}
        />
      </svg>
    </div>
  );
}
