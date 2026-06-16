'use client';

import { motion, LayoutGroup } from 'framer-motion';
import { Command, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelKeyboardIllustration } from '@/components/landing/illustrations/animated';
import { BorderBeam } from '@/components/ui/border-beam';
import { landingSectionBg, landingSurface, landingText, sectionLabel, type LandingTone } from '../theme';

const SHORTCUT_ICONS: Record<string, string> = {
  'Command palette': '#4285F4',
  'Archive thread': '#34A853',
  Reply: '#FBBC04',
  Compose: '#EA4335',
  'Go to inbox': '#4285F4',
  Search: '#5F6368',
};

function ShortcutChip({
  keys,
  action,
  tone,
  active,
  onClick,
}: {
  keys: string[];
  action: string;
  tone: LandingTone;
  active: boolean;
  onClick: () => void;
}) {
  const accent = SHORTCUT_ICONS[action] ?? '#4285F4';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'flex min-w-[140px] flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all',
        active
          ? 'border-[#1a73e8] bg-[#E8F0FE] shadow-md ring-2 ring-[#4285F4]/20'
          : 'border-[#E8EAED] bg-white hover:border-[#DADCE0] hover:shadow-sm'
      )}
    >
      <div className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className={cn(
              'rounded-lg border px-2 py-1 font-mono text-xs font-semibold shadow-sm',
              active ? 'border-[#1a73e8]/30 bg-white text-[#1a73e8]' : 'border-[#E8EAED] bg-[#F8F9FA] text-[#5F6368]'
            )}
          >
            {k}
          </kbd>
        ))}
      </div>
      <span className="flex items-center gap-2 text-sm font-medium" style={{ color: active ? accent : undefined }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <span className={cn(!active && landingText(tone, 'muted'))}>{action}</span>
      </span>
    </motion.button>
  );
}

export function KeyboardShortcutsSection({
  tone,
  shortcuts,
  activeShortcut,
  onSelect,
}: {
  tone: LandingTone;
  shortcuts: { keys: string[]; action: string }[];
  activeShortcut: number;
  onSelect: (i: number) => void;
}) {
  return (
    <section className={cn('border-y py-20', landingSectionBg('white'))}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className={sectionLabel(tone)}>Keyboard-first</p>
            <h2 className={cn('mt-3 text-3xl font-bold tracking-tight', landingText(tone, 'primary'))}>
              Speed is a feature.
            </h2>
            <p className={cn('mt-4 text-base leading-relaxed', landingText(tone, 'muted'))}>
              Click a shortcut to preview the action. Relvion is designed for people who keep their hands on the keyboard.
            </p>

            <motion.div
              key={activeShortcut}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-8 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-sm',
                landingSurface(tone, 'card')
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FE]">
                <Command className="h-5 w-5 text-[#1a73e8]" />
              </span>
              <div className="flex-1">
                <p className={cn('text-sm font-semibold', landingText(tone, 'primary'))}>
                  {shortcuts[activeShortcut].action}
                </p>
                <p className={cn('text-xs', landingText(tone, 'muted'))}>Press to execute instantly</p>
              </div>
              <span className="font-mono text-sm font-bold text-[#1a73e8]">
                {shortcuts[activeShortcut].keys.join(' ')}
              </span>
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-3">
              <LayoutGroup>
                {shortcuts.map((s, i) => (
                  <motion.div key={s.action} layout whileTap={{ scale: 0.96 }}>
                    <ShortcutChip
                      keys={s.keys}
                      action={s.action}
                      tone={tone}
                      active={activeShortcut === i}
                      onClick={() => onSelect(i)}
                    />
                  </motion.div>
                ))}
              </LayoutGroup>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#E8EAED] bg-gradient-to-br from-[#FEF7E0] via-white to-[#E8F0FE] p-4 shadow-xl">
            <BorderBeam size={180} duration={11} colorFrom="#FBBC04" colorTo="#4285F4" />
            <PixelKeyboardIllustration />
            <motion.div
              className="absolute bottom-6 left-6 right-6 rounded-2xl border border-[#E8EAED] bg-white/95 p-4 shadow-lg backdrop-blur-sm"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2 text-[#5F6368]">
                <Search className="h-4 w-4 text-[#1a73e8]" />
                <span className="text-sm">{shortcuts[activeShortcut].action}…</span>
                <kbd className="ml-auto rounded bg-[#F8F9FA] px-2 py-0.5 font-mono text-xs">
                  {shortcuts[activeShortcut].keys.join('+')}
                </kbd>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
