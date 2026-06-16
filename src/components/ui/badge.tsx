import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'urgent' | 'important' | 'fyi' | 'outline' | 'accent';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[#EBEAE5] text-[#5C5A54] border-[#D8D5CE] dark:bg-[#3c4043] dark:text-[#9aa0a6] dark:border-[#5f6368]',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  important: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  fyi: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
  outline: 'bg-transparent border-[#D8D5CE] text-[#5C5A54] dark:border-[#5f6368] dark:text-[#9aa0a6]',
  accent:
    'bg-[#E0F2F1] text-[#0D9488] border-[#0D9488]/20 dark:bg-[#8ab4f8]/15 dark:text-[#8ab4f8] dark:border-[#8ab4f8]/25',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function priorityToBadgeVariant(priority: string): BadgeVariant {
  if (priority === 'URGENT') return 'urgent';
  if (priority === 'IMPORTANT') return 'important';
  if (priority === 'FYI') return 'fyi';
  return 'default';
}
