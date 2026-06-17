'use client';

import { useEffect, useRef, useState } from 'react';
import { Palette, Check, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { useTheme, DASHBOARD_THEMES } from '@/components/dashboard/ThemeProvider';

export function ThemePicker({
  className,
  compact = false,
}: {
  className?: string;
  /** Compact toolbar style for TopBar — icons only, no swatch chips */
  compact?: boolean;
}) {
  const { theme, appearance, setTheme, toggleAppearance, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const current = DASHBOARD_THEMES.find((t) => t.id === theme);
  const isDark = appearance === 'dark';

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex shrink-0 items-center',
        compact
          ? cn('rounded-full border p-0.5', dash.border, dash.surface)
          : 'gap-0.5',
        className
      )}
    >
      <button
        type="button"
        onClick={toggleAppearance}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Light mode' : 'Dark mode'}
        className={cn(
          'flex items-center justify-center transition-colors',
          compact ? 'h-8 w-8 rounded-full' : 'h-9 w-9 rounded-lg',
          dash.hover,
          dash.textMuted,
          isDark && dash.accentSoft
        )}
      >
        {mounted ? (
          isDark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />
        ) : (
          <span className="h-4 w-4" />
        )}
      </button>

      {compact && <span className={cn('h-4 w-px shrink-0', dash.divider)} aria-hidden />}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Change theme"
        title={current ? `Theme: ${current.name}` : 'Change theme'}
        className={cn(
          'relative flex items-center justify-center transition-colors',
          compact ? 'h-8 w-8 rounded-full' : 'h-9 gap-1.5 rounded-lg px-2.5',
          dash.hover,
          dash.textMuted,
          dash.accentHover
        )}
      >
        {mounted ? (
          <>
            <Palette size={16} strokeWidth={1.75} />
            {!compact && (
              <span className="hidden gap-0.5 lg:flex">
                {current?.swatches.map((c) => (
                  <span
                    key={c}
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
            )}
          </>
        ) : (
          <span className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-[250] mt-2 w-72 overflow-hidden rounded-2xl border p-2 shadow-2xl',
            dash.elevated
          )}
        >
          <p className={cn('px-2 py-1.5 text-xs font-semibold uppercase tracking-wider', dash.textSubtle)}>
            Dashboard theme · {isDark ? 'Dark' : 'Light'}
          </p>
          <div className="max-h-[min(360px,60vh)] space-y-1 overflow-y-auto">
            {DASHBOARD_THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    active ? dash.accentSoft : dash.hover
                  )}
                >
                  <div className="flex shrink-0 gap-1">
                    {t.swatches.map((c) => (
                      <span
                        key={c}
                        className="h-5 w-3 rounded-sm ring-1 ring-black/8 first:rounded-l-md last:rounded-r-md"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', dash.text)}>{t.name}</p>
                    <p className={cn('truncate text-xs', dash.textSubtle)}>{t.description}</p>
                  </div>
                  {active && <Check size={16} className={dash.accent} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
