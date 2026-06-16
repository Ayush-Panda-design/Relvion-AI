'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

type GlassEmailRowProps = {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
};

/** Lightweight glass row — CSS-only transitions for instant click response. */
export function GlassEmailRow({ children, className, isSelected, onClick }: GlassEmailRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative mx-2 mb-1 cursor-pointer rounded-xl border backdrop-blur-sm',
        'transition-[background-color,border-color,box-shadow,transform] duration-100 active:scale-[0.998]',
        'bg-[#FAF9F6]/55 border-[#D8D5CE]/60',
        'dark:bg-[#292a2d]/75 dark:border-[#3c4043]/90',
        'hover:border-[#0D9488]/35 dark:hover:border-[#8ab4f8]/40',
        isSelected && cn(dash.rowActive, 'ring-1 ring-[#0D9488]/20 dark:ring-[#8ab4f8]/25'),
        className
      )}
    >
      {children}
    </div>
  );
}
