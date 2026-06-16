'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Wireframe nodes — connection pulse animation for integrations */
export function WireframeIntegrationsIllustration({ className }: { className?: string }) {
  const nodes = [
    { cx: 200, cy: 150, r: 40, label: 'Relvion', color: '#4285F4' },
    { cx: 80, cy: 80, r: 28, label: 'Gmail', color: '#EA4335' },
    { cx: 320, cy: 70, r: 28, label: 'Calendar', color: '#4285F4' },
    { cx: 340, cy: 220, r: 28, label: 'Gemini', color: '#34A853' },
    { cx: 70, cy: 210, r: 28, label: 'OAuth', color: '#FBBC04' },
  ];

  const edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ];

  return (
    <div className={cn('relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-[#F8F9FA]', className)}>
      <svg viewBox="0 0 400 280" className="h-full w-full" aria-hidden>
        {edges.map(([a, b], i) => {
          const n1 = nodes[a];
          const n2 = nodes[b];
          return (
            <g key={i}>
              <motion.line
                x1={n1.cx}
                y1={n1.cy}
                x2={n2.cx}
                y2={n2.cy}
                stroke="#DADCE0"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
              <motion.circle
                r="4"
                fill={n2.color}
                animate={{
                  cx: [n1.cx, n2.cx, n1.cx],
                  cy: [n1.cy, n2.cy, n1.cy],
                }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.7, ease: 'linear' }}
              />
            </g>
          );
        })}

        {nodes.map((n, i) => (
          <motion.g
            key={n.label}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 + i * 0.1 }}
          >
            <motion.circle
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill="none"
              stroke={n.color}
              strokeWidth={i === 0 ? 3 : 2}
              animate={i === 0 ? { scale: [1, 1.05, 1] } : { y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
              style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
            />
            <circle cx={n.cx} cy={n.cy} r={n.r - 6} fill={`${n.color}18`} />
            <text
              x={n.cx}
              y={n.cy + 4}
              textAnchor="middle"
              fill={n.color}
              fontSize={i === 0 ? 11 : 9}
              fontWeight="700"
            >
              {n.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
