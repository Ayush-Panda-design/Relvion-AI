'use client';

import { useEffect, useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

export type EmailTemplate = {
  id: string;
  name: string;
  subject?: string;
  body?: string;
};

export function TemplatePicker({
  onSelect,
  className,
}: {
  onSelect: (template: EmailTemplate) => void;
  className?: string;
}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/gmail/templates')
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || templates.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
          dash.border,
          dash.textMuted,
          'hover:border-[#0D9488]/40 hover:text-[#0D9488] dark:hover:border-[#8ab4f8]/40 dark:hover:text-[#8ab4f8]'
        )}
      >
        <FileText size={13} />
        Templates
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className={cn(
            'absolute bottom-full left-0 z-20 mb-1 min-w-[200px] overflow-hidden rounded-xl border shadow-lg',
            dash.elevated,
            dash.border
          )}
        >
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onSelect(t);
                setOpen(false);
              }}
              className={cn(
                'block w-full px-3 py-2 text-left text-xs transition-colors',
                dash.hover,
                dash.text
              )}
            >
              <span className="font-medium">{t.name}</span>
              {t.subject && (
                <span className={cn('mt-0.5 block truncate', dash.textSubtle)}>{t.subject}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
