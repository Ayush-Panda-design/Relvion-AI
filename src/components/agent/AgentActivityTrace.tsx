'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Search,
  User,
  Mail,
  Send,
  Calendar,
  FileCode,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import type { AgentStep, AgentStepIcon } from '@/lib/agent-stream';

const ICONS: Record<AgentStepIcon, typeof Brain> = {
  brain: Brain,
  search: Search,
  user: User,
  mail: Mail,
  send: Send,
  calendar: Calendar,
  schema: FileCode,
  code: FileCode,
  check: CheckCircle2,
};

export function AgentActivityTrace({ steps }: { steps: AgentStep[] }) {
  const [expanded, setExpanded] = useState(false);
  if (steps.length === 0) return null;

  const allDone = steps.every((s) => s.status === 'done' || s.status === 'error');
  const visible = expanded || !allDone ? steps : steps.slice(-1);

  return (
    <div className={cn('mb-2 rounded-xl border px-3 py-2', dash.border, dash.surface)}>
      <button
        type="button"
        onClick={() => allDone && setExpanded((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-2 text-left',
          allDone && 'cursor-pointer'
        )}
      >
        <span className={cn('text-[11px] font-semibold uppercase tracking-wider', dash.textSubtle)}>
          Agent activity
        </span>
        {allDone && (
          <ChevronDown
            size={14}
            className={cn('transition-transform', dash.textMuted, expanded && 'rotate-180')}
          />
        )}
      </button>

      <ul className="mt-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {visible.map((step) => {
            const Icon = ICONS[step.icon] ?? Brain;
            const isActive = step.status === 'active';
            const isDone = step.status === 'done';
            const isError = step.status === 'error';

            return (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2"
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    isActive && cn(dash.accentSoft, 'animate-pulse'),
                    isDone && 'bg-emerald-500/15 text-emerald-500',
                    isError && 'bg-red-500/15 text-red-400',
                    step.status === 'pending' && dash.accentSoftBg
                  )}
                >
                  {isActive ? (
                    <Loader2 size={11} className={cn('animate-spin', dash.accent)} />
                  ) : isDone ? (
                    <CheckCircle2 size={11} />
                  ) : (
                    <Icon size={11} className={dash.accent} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-xs font-medium', isActive ? dash.text : dash.textMuted)}>
                      {step.label}
                    </span>
                    <span className={cn('shrink-0 text-[10px] tabular-nums', dash.textSubtle)}>
                      {step.timestamp}
                    </span>
                  </div>
                  {step.detail && (
                    <p className={cn('mt-0.5 truncate text-[10px]', dash.textSubtle)}>{step.detail}</p>
                  )}
                  {step.toolName && expanded && (
                    <p className={cn('mt-1 font-mono text-[10px]', dash.code)}>
                      └─ {step.toolName}
                    </p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
