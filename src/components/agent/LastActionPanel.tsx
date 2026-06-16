'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';
import type { LastActionData } from '@/lib/agent-stream';

export function LastActionPanel({
  action,
  onClose,
}: {
  action: LastActionData | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {action && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className={cn(
            'absolute inset-y-0 right-0 z-30 flex w-[min(100%,280px)] flex-col border-l shadow-2xl',
            dash.elevated,
            dash.border
          )}
        >
          <div className={cn('flex items-center justify-between border-b px-3 py-2.5', dash.border)}>
            <div>
              <p className={cn('text-xs font-semibold', dash.text)}>Last action</p>
              <p className={cn('font-mono text-[10px]', dash.textSubtle)}>{action.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn('rounded-lg p-1.5', dash.hover, dash.textMuted)}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div className="flex items-center gap-2">
              {action.status === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <AlertCircle size={16} className="text-red-400" />
              )}
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                  action.status === 'success' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-400'
                )}
              >
                {action.status}
              </span>
            </div>

            <div>
              <p className={cn('mb-2 text-[11px] font-semibold uppercase tracking-wider', dash.textSubtle)}>
                Details
              </p>
              <dl className="space-y-1.5">
                {action.fields.map(({ key, value }) => (
                  <div key={key} className="flex gap-2 text-xs">
                    <dt className={cn('w-20 shrink-0', dash.textSubtle)}>{key}</dt>
                    <dd className={cn('min-w-0 flex-1 truncate font-medium', dash.text)}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {action.preview && (
              <div>
                <p className={cn('mb-2 text-[11px] font-semibold uppercase tracking-wider', dash.textSubtle)}>
                  Email preview
                </p>
                <div className={cn('rounded-lg border p-3 text-xs leading-relaxed', dash.border, dash.surface)}>
                  {action.preview}
                </div>
              </div>
            )}

            {action.summary && (
              <div>
                <p className={cn('mb-2 text-[11px] font-semibold uppercase tracking-wider', dash.textSubtle)}>
                  Conversation summary
                </p>
                <p className={cn('text-xs leading-relaxed', dash.textMuted)}>{action.summary}</p>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
