'use client';

import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

type ShimmerProps = {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'xl' | '2xl';
  style?: CSSProperties;
};

const ROUNDED = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

/** Aceternity-style shimmer block — theme-aware. */
export function Shimmer({ className, rounded = 'md', style }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        ROUNDED[rounded],
        'bg-[#E8E6E1] dark:bg-[#3c4043]/60',
        className
      )}
      style={style}
    >
      <div
        className={cn(
          'absolute inset-0 -translate-x-full animate-[dashShimmer_1.8s_ease-in-out_infinite]',
          'bg-gradient-to-r from-transparent via-[#FAF9F6]/80 to-transparent',
          'dark:via-white/10'
        )}
      />
    </div>
  );
}
