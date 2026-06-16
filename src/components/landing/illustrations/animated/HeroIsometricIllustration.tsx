'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Isometric 3D workspace — floating layers, distinct from flat character art */
export function HeroIsometricIllustration({ className }: { className?: string }) {
  return (
    <div className={cn('relative aspect-[5/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F0FE] to-[#E6F4EA]', className)}>
      <svg viewBox="0 0 500 300" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="iso-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="100%" stopColor="#1a73e8" />
          </linearGradient>
          <linearGradient id="iso-green" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34A853" />
            <stop offset="100%" stopColor="#188038" />
          </linearGradient>
        </defs>

        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M80 200 L200 130 L320 200 L200 270 Z" fill="#DADCE0" opacity="0.5" />
          <path d="M120 175 L220 120 L300 175 L220 230 Z" fill="url(#iso-blue)" opacity="0.9" />
          <path d="M140 155 L220 110 L280 155 L220 200 Z" fill="#fff" stroke="#4285F4" strokeWidth="2" />
          <text x="220" y="165" textAnchor="middle" fill="#1a73e8" fontSize="11" fontWeight="700">
            Inbox
          </text>
        </motion.g>

        <motion.g
          animate={{ y: [0, 8, 0], x: [0, 4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <path d="M280 160 L380 105 L440 160 L340 215 Z" fill="url(#iso-green)" opacity="0.85" />
          <path d="M300 140 L370 100 L420 140 L350 180 Z" fill="#fff" stroke="#34A853" strokeWidth="2" />
          <text x="360" y="148" textAnchor="middle" fill="#34A853" fontSize="10" fontWeight="700">
            Agent
          </text>
        </motion.g>

        <motion.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <path d="M60 120 L140 75 L220 120 L140 165 Z" fill="#FBBC04" opacity="0.9" />
          <path d="M80 105 L140 70 L180 105 L120 140 Z" fill="#fff" stroke="#FBBC04" strokeWidth="2" />
          <text x="130" y="115" textAnchor="middle" fill="#E37400" fontSize="10" fontWeight="700">
            Calendar
          </text>
        </motion.g>

        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={400 + i * 25}
            cy={60 + i * 15}
            r="6"
            fill={['#EA4335', '#4285F4', '#34A853'][i]}
            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </svg>
    </div>
  );
}
