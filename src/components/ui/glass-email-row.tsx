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

/** Lightweight glass row — theme-aware via CSS variables. */
export function GlassEmailRow({ children, className, isSelected, onClick }: GlassEmailRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative mx-2 mb-1 cursor-pointer rounded-xl border backdrop-blur-sm',
        'transition-[background-color,border-color,box-shadow,transform] duration-100 active:scale-[0.998]',
        'bg-[var(--dash-surface)]/80 border-[var(--dash-border)]',
        'hover:border-[var(--dash-input-focus-border)]',
        isSelected && cn(dash.rowActive, 'ring-1 ring-[var(--dash-search-focus-ring)]'),
        className
      )}
    >
      {children}
    </div>
  );
}
