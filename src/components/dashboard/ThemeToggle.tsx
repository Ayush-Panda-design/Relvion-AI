'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { useTheme } from '@/components/dashboard/ThemeProvider';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
        dash.hover,
        dash.textMuted,
        dash.accentHover,
        className
      )}
    >
      {mounted ? (
        isDark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}
