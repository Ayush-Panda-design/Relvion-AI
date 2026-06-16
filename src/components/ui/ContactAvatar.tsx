'use client';

import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import { contactAvatarVariantIndex, getContactInitials } from '@/lib/contact-avatar';

/** Minimal person glyph — diagram / wireframe style */
function PersonGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="8.5" r="3.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.5 19.5c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const DIAGRAM_VARIANTS = [
  cn('border', dash.border, dash.surface, dash.textMuted),
  cn('border border-dashed', dash.border, 'bg-transparent', dash.textSubtle),
  cn('border', dash.border, dash.iconWell),
  cn('border', dash.border, dash.accentSoft),
] as const;

export function ContactAvatar({
  name,
  sizeClass = 'h-10 w-10 text-xs',
  className,
  variant = 'diagram',
  initials: initialsOverride,
  showGlyph = true,
}: {
  name: string;
  sizeClass?: string;
  className?: string;
  /** diagram = muted wireframe style; theme = accent well for current user */
  variant?: 'diagram' | 'theme';
  initials?: string;
  /** Show small person outline behind initials */
  showGlyph?: boolean;
}) {
  const initials = (initialsOverride ?? getContactInitials(name)).slice(0, 2);
  const variantIdx = contactAvatarVariantIndex(name);
  const isCompact = sizeClass.includes('h-8');

  if (variant === 'theme') {
    return (
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-full border font-semibold uppercase tracking-tight',
          dash.border,
          dash.iconWell,
          sizeClass,
          className
        )}
        title={name}
      >
        {showGlyph && !isCompact && (
          <PersonGlyph className="absolute h-[55%] w-[55%] opacity-[0.22]" />
        )}
        <span className="relative z-[1]">{initials.slice(0, 1)}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full font-semibold uppercase tracking-tight',
        DIAGRAM_VARIANTS[variantIdx],
        sizeClass,
        className
      )}
      title={name}
    >
      {showGlyph && (
        <PersonGlyph
          className={cn(
            'absolute opacity-[0.18]',
            isCompact ? 'h-[70%] w-[70%]' : 'h-[58%] w-[58%]'
          )}
        />
      )}
      <span className="relative z-[1] text-[0.85em] font-medium leading-none">{initials}</span>
    </div>
  );
}
