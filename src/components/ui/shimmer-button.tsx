'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Magic UI–style shimmer CTA — uses existing compose gradient tokens. */
export function ShimmerButton({
  children,
  className,
  shimmerClassName,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  shimmerClassName?: string;
}) {
  return (
    <button
      type="button"
      className={cn('group relative overflow-hidden', className)}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-0 -translate-x-full',
          'bg-gradient-to-r from-transparent via-white/25 to-transparent',
          'dark:via-[#8ab4f8]/30',
          'animate-[dashShimmer_2.4s_ease-in-out_infinite]',
          shimmerClassName
        )}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
