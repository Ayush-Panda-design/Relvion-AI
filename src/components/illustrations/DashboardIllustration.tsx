'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import './illustration-theme.css';

export type IllustrationVariant =
  | 'inbox'
  | 'sent'
  | 'drafts'
  | 'snoozed'
  | 'spam'
  | 'trash'
  | 'calendar'
  | 'analytics'
  | 'search'
  | 'connect';

const COPY: Record<
  IllustrationVariant,
  { title: string; subtitle: string }
> = {
  inbox: {
    title: "You're all caught up",
    subtitle: 'No messages in this folder. Enjoy the calm.',
  },
  sent: {
    title: 'No sent messages yet',
    subtitle: 'Emails you send will appear here.',
  },
  drafts: {
    title: 'No drafts saved',
    subtitle: 'Start composing — drafts autosave as you write.',
  },
  snoozed: {
    title: 'Nothing snoozed',
    subtitle: 'Snooze emails to deal with them later.',
  },
  spam: {
    title: 'No spam here',
    subtitle: 'Your filter is keeping junk out of sight.',
  },
  trash: {
    title: 'Trash is empty',
    subtitle: 'Deleted messages will show up here.',
  },
  calendar: {
    title: 'Your schedule is clear',
    subtitle: 'Create an event when you are ready to plan ahead.',
  },
  analytics: {
    title: 'Analytics will appear here',
    subtitle: 'Connect Gmail and Calendar to see insights and trends.',
  },
  search: {
    title: 'No matches found',
    subtitle: 'Try different keywords or search operators.',
  },
  connect: {
    title: 'Connect your Google account',
    subtitle: 'Link Gmail and Calendar to power your workspace.',
  },
};

function InboxSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <path
        d="M38 68 L100 98 L162 68 V118 C162 124 157 129 151 129 H49 C43 129 38 124 38 118 V68Z"
        fill="var(--ill-surface)"
        stroke="var(--ill-line)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M38 68 L100 98 L162 68" stroke="var(--ill-line)" strokeWidth="2" strokeLinejoin="round" />
      <rect x="72" y="52" width="56" height="36" rx="4" fill="var(--ill-accent)" opacity="0.9" />
      <path d="M80 64 H120 M80 72 H112" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <circle cx="148" cy="48" r="14" fill="var(--ill-accent-2)" className="ill-drift" />
      <path d="M142 48 L146 52 L154 44" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SentSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <path
        d="M28 88 L88 58 L148 88 L88 118 Z"
        fill="var(--ill-accent-2)"
        stroke="var(--ill-line)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="ill-drift"
      />
      <path d="M88 58 V118" stroke="var(--ill-line)" strokeWidth="1.5" opacity="0.4" />
      <circle cx="156" cy="52" r="18" fill="var(--ill-surface)" stroke="var(--ill-line)" strokeWidth="2" />
      <path
        d="M148 52 H164 M156 44 V60"
        stroke="var(--ill-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M52 96 Q72 80 92 96"
        stroke="var(--ill-accent-3)"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

function DraftsSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <rect x="58" y="36" width="84" height="96" rx="8" fill="var(--ill-surface)" stroke="var(--ill-line)" strokeWidth="2" />
      <path d="M72 56 H128 M72 68 H120 M72 80 H110" stroke="var(--ill-line-muted)" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M130 108 L148 126 L130 126 Z"
        fill="var(--ill-accent-2)"
        stroke="var(--ill-line)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="124" y="100" width="8" height="28" rx="2" fill="var(--ill-accent)" transform="rotate(-35 128 114)" />
    </svg>
  );
}

function SnoozedSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <circle cx="100" cy="82" r="40" fill="var(--ill-surface)" stroke="var(--ill-line)" strokeWidth="2" />
      <path d="M100 82 V58" stroke="var(--ill-accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 82 H118" stroke="var(--ill-accent-2)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="82" r="4" fill="var(--ill-line)" />
      <text x="128" y="48" fill="var(--ill-accent-3)" fontSize="14" fontWeight="600" fontFamily="sans-serif">
        z
      </text>
      <text x="140" y="40" fill="var(--ill-accent-3)" fontSize="11" fontWeight="600" fontFamily="sans-serif" opacity="0.7">
        z
      </text>
    </svg>
  );
}

function SpamSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <path
        d="M100 38 L148 58 V92 C148 110 126 124 100 124 C74 124 52 110 52 92 V58 Z"
        fill="var(--ill-accent-3)"
        opacity="0.85"
        stroke="var(--ill-line)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M100 58 V88 M88 73 H112" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function TrashSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <rect x="68" y="52" width="64" height="72" rx="6" fill="var(--ill-surface)" stroke="var(--ill-line)" strokeWidth="2" />
      <path d="M60 52 H140" stroke="var(--ill-line)" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="88" y="44" width="24" height="10" rx="3" fill="var(--ill-accent-2)" stroke="var(--ill-line)" strokeWidth="1.5" />
      <path d="M82 68 H118 M82 82 H118 M82 96 H110" stroke="var(--ill-line-muted)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <rect x="48" y="44" width="104" height="88" rx="10" fill="var(--ill-surface)" stroke="var(--ill-line)" strokeWidth="2" />
      <rect x="48" y="44" width="104" height="24" rx="10" fill="var(--ill-accent)" />
      <path d="M68 36 V52 M132 36 V52" stroke="var(--ill-line)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="76" cy="84" r="6" fill="var(--ill-surface-2)" />
      <circle cx="100" cy="84" r="6" fill="var(--ill-surface-2)" />
      <circle cx="124" cy="84" r="6" fill="var(--ill-highlight)" className="ill-drift" />
      <circle cx="76" cy="108" r="6" fill="var(--ill-surface-2)" />
      <circle cx="100" cy="108" r="6" fill="var(--ill-surface-2)" />
      <circle cx="124" cy="108" r="6" fill="var(--ill-surface-2)" />
    </svg>
  );
}

function AnalyticsSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <rect x="44" y="100" width="112" height="8" rx="4" fill="var(--ill-surface-2)" />
      <rect x="56" y="72" width="18" height="36" rx="4" fill="var(--ill-accent)" className="ill-float" />
      <rect x="84" y="56" width="18" height="52" rx="4" fill="var(--ill-accent-3)" />
      <rect x="112" y="40" width="18" height="68" rx="4" fill="var(--ill-accent-2)" className="ill-float" style={{ animationDelay: '0.6s' }} />
      <path
        d="M52 48 L78 58 L104 42 L130 52 L156 36"
        stroke="var(--ill-highlight)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="156" cy="36" r="5" fill="var(--ill-highlight)" />
    </svg>
  );
}

function SearchSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <circle cx="88" cy="76" r="32" fill="var(--ill-surface)" stroke="var(--ill-line)" strokeWidth="2.5" />
      <path d="M110 98 L138 126" stroke="var(--ill-accent-2)" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 76 H100 M88 64 V88" stroke="var(--ill-line-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <circle cx="148" cy="48" r="10" fill="var(--ill-accent)" opacity="0.2" className="ill-drift" />
    </svg>
  );
}

function ConnectSvg() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden className="h-full w-full">
      <ellipse cx="100" cy="138" rx="52" ry="6" fill="var(--ill-surface-2)" opacity="0.6" />
      <path
        d="M52 88 C52 68 72 52 100 52 C128 52 148 68 148 88 C148 108 128 124 100 124 C72 124 52 108 52 88Z"
        fill="var(--ill-surface)"
        stroke="var(--ill-line)"
        strokeWidth="2"
      />
      <path
        d="M88 88 C88 78 94 72 100 72 C106 72 112 78 112 88 C112 98 106 104 100 104 C94 104 88 98 88 88Z"
        fill="var(--ill-accent)"
      />
      <path
        d="M100 72 V60 M100 104 V116 M72 88 H60 M128 88 H140"
        stroke="var(--ill-accent-2)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="ill-drift"
      />
    </svg>
  );
}

const SVG_MAP: Record<IllustrationVariant, () => ReactNode> = {
  inbox: InboxSvg,
  sent: SentSvg,
  drafts: DraftsSvg,
  snoozed: SnoozedSvg,
  spam: SpamSvg,
  trash: TrashSvg,
  calendar: CalendarSvg,
  analytics: AnalyticsSvg,
  search: SearchSvg,
  connect: ConnectSvg,
};

export function folderToIllustration(folder: string): IllustrationVariant {
  const map: Record<string, IllustrationVariant> = {
    inbox: 'inbox',
    sent: 'sent',
    drafts: 'drafts',
    snoozed: 'snoozed',
    spam: 'spam',
    trash: 'trash',
  };
  return map[folder] || 'inbox';
}

type Props = {
  variant: IllustrationVariant;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
  showText?: boolean;
  className?: string;
};

const SIZES = {
  sm: 'h-[100px] w-[130px]',
  md: 'h-[130px] w-[170px]',
  lg: 'h-[160px] w-[200px]',
};

export function DashboardIllustration({
  variant,
  size = 'md',
  title,
  subtitle,
  showText = true,
  className,
}: Props) {
  const copy = COPY[variant];
  const Svg = SVG_MAP[variant];

  return (
    <div className={cn('ill-theme flex flex-col items-center text-center', className)}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('ill-float mb-4', SIZES[size])}
      >
        <Svg />
      </motion.div>
      {showText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.3 }}
          className="max-w-[280px] space-y-1 px-4"
        >
          <p className={cn('text-sm font-medium', dash.text)}>{title ?? copy.title}</p>
          <p className={cn('text-xs leading-relaxed', dash.textMuted)}>{subtitle ?? copy.subtitle}</p>
        </motion.div>
      )}
    </div>
  );
}
