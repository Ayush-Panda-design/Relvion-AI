'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageEnterProps = {
  children: ReactNode;
  className?: string;
  /** Re-mount animation when key changes (e.g. folder switch) */
  layoutKey?: string;
};

/** Subtle page entrance — Aceternity blur-fade style */
export function PageEnter({ children, className, layoutKey }: PageEnterProps) {
  return (
    <motion.div
      key={layoutKey}
      initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.42, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn('flex min-h-0 flex-1 flex-col', className)}
    >
      {children}
    </motion.div>
  );
}

/** Staggered list item wrapper for loaded rows */
export function StaggerItem({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.03, 0.24),
        duration: 0.28,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
