'use client';

import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

const QUICK_ACTIONS = [
  { label: '📧 Summarize inbox', prompt: 'Summarize my inbox — highlight urgent items and anything I should reply to today.' },
  { label: "📅 What's today?", prompt: "What's on my calendar today? List meetings with times." },
  { label: '✍️ Draft a reply', prompt: 'Help me draft a professional reply to my most recent important email.' },
];

export function AgentEmptyState({ onQuickAction }: { onQuickAction: (prompt: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
      <div className="relative mb-6 h-24 w-24">
        <div
          className="absolute inset-0 rounded-full opacity-60 animate-[orbitSpin_8s_linear_infinite]"
          style={{
            background:
              'conic-gradient(from 0deg, var(--dash-accent), transparent, var(--dash-accent-soft-text), transparent)',
          }}
        />
        <div
          className={cn(
            'absolute inset-2 rounded-full',
            dash.surface,
            'shadow-[var(--dash-elevated-shadow)]'
          )}
        />
        <div
          className="absolute inset-4 rounded-full blur-md"
          style={{ background: 'var(--dash-accent-soft-bg)' }}
        />
      </div>

      <h3 className={cn('text-lg font-semibold tracking-tight', dash.text)}>What can I help you with?</h3>
      <p className={cn('mt-2 max-w-[240px] text-sm leading-relaxed', dash.textMuted)}>
        I can read your emails, manage your calendar, and send messages.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => onQuickAction(a.prompt)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              dash.border,
              dash.hover,
              dash.textMuted
            )}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { QUICK_ACTIONS };
