'use client';

import { motion } from 'framer-motion';

const ORBS: { color: string; size: string; dur: number; top?: string; left?: string; right?: string; bottom?: string }[] = [
  { color: '#4285F4', size: 'h-32 w-32', top: '10%', left: '5%', dur: 7 },
  { color: '#34A853', size: 'h-24 w-24', top: '60%', right: '8%', dur: 9 },
  { color: '#FBBC04', size: 'h-20 w-20', bottom: '15%', left: '20%', dur: 8 },
];

/** Subtle floating color orbs for section backgrounds */
export function SectionFloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {ORBS.map((orb, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full opacity-30 blur-3xl ${orb.size}`}
          style={{
            backgroundColor: orb.color,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
          }}
          animate={{ y: [0, -20, 0], x: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}
