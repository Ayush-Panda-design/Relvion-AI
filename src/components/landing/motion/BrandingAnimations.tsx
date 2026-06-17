'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, Sparkles, ArrowRight, MousePointerClick } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { FlipWords } from '@/components/ui/flip-words';
import { BlurFade } from '@/components/ui/blur-fade';

/* ─── 1. Brand promise typewriter ─────────────────────── */

const BRAND_PROMISES = [
  { text: 'Your morning, reclaimed.' },
  { text: 'Less noise. More momentum.' },
  { text: 'Email that respects your focus.' },
  { text: 'One place for mail and meetings.' },
];

export function BrandPromiseTypewriter({ className }: { className?: string }) {
  return (
    <p className={cn('text-base leading-relaxed text-[#5F6368]', className)}>
      Relvion is built for people who want{' '}
      <TypewriterEffect
        words={BRAND_PROMISES}
        className="font-semibold text-[#1a73e8]"
        cursorClassName="bg-[#1a73e8]"
      />
    </p>
  );
}

/* ─── 2. Interactive priority inbox peek ──────────────── */

const PEEK_EMAILS = [
  { from: 'Sarah Chen', subject: 'Need your input by Friday', tag: 'Urgent', color: '#EA4335', bg: '#FCE8E6' },
  { from: 'Design Team', subject: 'Mockups ready for review', tag: 'Important', color: '#E37400', bg: '#FEF7E0' },
  { from: 'Weekly Digest', subject: 'Your subscriptions roundup', tag: 'FYI', color: '#5F6368', bg: '#F8F9FA' },
];

export function InteractivePriorityPeek() {
  const [sorted, setSorted] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const display = sorted
    ? [...PEEK_EMAILS].sort((a, b) => {
        const order = { Urgent: 0, Important: 1, FYI: 2 };
        return (order[a.tag as keyof typeof order] ?? 3) - (order[b.tag as keyof typeof order] ?? 3);
      })
    : PEEK_EMAILS;

  return (
    <div className="rounded-2xl border border-[#E8EAED] bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#80868B]">
          Tap a thread — watch priority rise
        </p>
        <MousePointerClick className="h-3.5 w-3.5 text-[#1a73e8]" />
      </div>
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {display.map((email) => (
            <motion.button
              key={email.from}
              type="button"
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={() => {
                if (sorted && highlighted === email.from) {
                  setSorted(false);
                  setHighlighted(null);
                } else {
                  setSorted(true);
                  setHighlighted(email.from);
                }
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors',
                highlighted === email.from
                  ? 'border-[#1a73e8]/40 bg-[#E8F0FE]'
                  : 'border-[#E8EAED] bg-[#FAFBFC] hover:border-[#DADCE0]'
              )}
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#5F6368]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#202124]">{email.from}</p>
                <p className="truncate text-[10px] text-[#80868B]">{email.subject}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                style={{ backgroundColor: email.bg, color: email.color }}
              >
                {email.tag}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      {sorted && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-[10px] leading-relaxed text-[#5F6368]"
        >
          Important mail floats up — so you start with what actually matters.
        </motion.p>
      )}
    </div>
  );
}

/* ─── 3. Curiosity brand chips ────────────────────────── */

const BRAND_CHIPS = [
  { id: 'clarity', label: 'Clarity', reveal: 'See the signal in your inbox before the noise pulls you in.' },
  { id: 'momentum', label: 'Momentum', reveal: 'Reply, schedule, and move on — without losing your flow.' },
  { id: 'calm', label: 'Calm', reveal: 'One calm workspace instead of five frantic browser tabs.' },
  { id: 'control', label: 'Control', reveal: 'Your rules, your shortcuts, your way of working — not Google\'s default.' },
];

export function CuriosityBrandChips({ className }: { className?: string }) {
  const [selected, setSelected] = useState(BRAND_CHIPS[0].id);
  const active = BRAND_CHIPS.find((c) => c.id === selected)!;

  return (
    <div className={cn('rounded-2xl border border-[#E8EAED] bg-white/80 p-4', className)}>
      <p className="text-xs font-medium text-[#80868B]">What Relvion feels like — pick a word</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {BRAND_CHIPS.map((chip) => (
          <motion.button
            key={chip.id}
            type="button"
            onClick={() => setSelected(chip.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              selected === chip.id
                ? 'border-[#1a73e8] bg-[#E8F0FE] text-[#1a73e8]'
                : 'border-[#E8EAED] bg-[#FAFBFC] text-[#5F6368] hover:border-[#DADCE0]'
            )}
          >
            {chip.label}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="mt-4 text-sm leading-relaxed text-[#3C4043]"
        >
          <span className="font-semibold text-[#1a73e8]">{active.label}.</span> {active.reveal}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ─── 4. Interactive day flow ─────────────────────────── */

const DAY_STEPS = [
  { icon: Mail, label: 'Open Relvion', hint: 'One tab. Inbox and calendar together.' },
  { icon: Sparkles, label: 'Triage in seconds', hint: 'Urgent threads rise — the rest can wait.' },
  { icon: Calendar, label: 'Book from mail', hint: 'Turn a thread into a meeting without switching apps.' },
  { icon: ArrowRight, label: 'Back to building', hint: 'Close the tab. Your day is handled.' },
];

export function InteractiveDayFlow() {
  const [step, setStep] = useState(0);
  const current = DAY_STEPS[step];

  const advance = useCallback(() => {
    setStep((s) => (s + 1) % DAY_STEPS.length);
  }, []);

  return (
    <div className="rounded-2xl border border-[#E8EAED] bg-gradient-to-br from-[#E8F0FE]/50 via-white to-[#E6F4EA]/40 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#80868B]">
        A better morning — tap through
      </p>
      <div className="mt-4 flex gap-2">
        {DAY_STEPS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              'h-2 flex-1 rounded-full transition-all',
              i <= step ? 'bg-[#1a73e8]' : 'bg-[#E8EAED]'
            )}
            aria-label={s.label}
          />
        ))}
      </div>
      <motion.button
        type="button"
        onClick={advance}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="mt-5 flex w-full items-start gap-4 rounded-xl border border-[#E8EAED] bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <motion.span
          key={step}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1a73e8]"
        >
          <current.icon className="h-5 w-5" />
        </motion.span>
        <div>
          <p className="font-semibold text-[#202124]">{current.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#5F6368]">{current.hint}</p>
          <p className="mt-2 text-[10px] font-medium text-[#1a73e8]">Tap to continue →</p>
        </div>
      </motion.button>
    </div>
  );
}

/* ─── 5. Flip-brand headline line ─────────────────────── */

export function FlipBrandHeadline({ className }: { className?: string }) {
  return (
    <p className={cn('text-base leading-relaxed text-[#5F6368]', className)}>
      We believe your workday should feel{' '}
      <FlipWords
        words={['focused', 'lighter', 'intentional', 'yours']}
        className="font-semibold"
        duration={2600}
      />
      {' '}— not like a pile of tabs fighting for attention.
    </p>
  );
}

/* ─── 6. Mini agent curiosity teaser ──────────────────── */

const AGENT_TEASERS = [
  { prompt: 'What needs me today?', reply: 'Two threads need you: a Friday deadline from Sarah, and a meeting request from Alex.' },
  { prompt: 'Draft a warm reply', reply: 'Here\'s a friendly draft in your tone — ready when you are.' },
  { prompt: 'Find time Thursday', reply: 'Thursday 3:30 PM is open. Want me to send an invite?' },
];

export function MiniAgentCuriosity() {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const run = (i: number) => {
    setIdx(i);
    setRevealed(false);
    setTimeout(() => setRevealed(true), 300);
  };

  return (
    <div className="mt-6 rounded-2xl border border-[#E8EAED] bg-[#FAFBFC] p-4">
      <p className="text-center text-xs font-medium text-[#80868B]">
        Curious how the agent thinks? Try a phrase
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {AGENT_TEASERS.map((t, i) => (
          <motion.button
            key={t.prompt}
            type="button"
            onClick={() => run(i)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              idx === i && revealed
                ? 'border-[#1a73e8] bg-[#E8F0FE] text-[#1a73e8]'
                : 'border-[#E8EAED] bg-white text-[#5F6368] hover:border-[#DADCE0]'
            )}
          >
            &ldquo;{t.prompt}&rdquo;
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {revealed && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl border border-[#A8C7FA] bg-[#E8F0FE] px-4 py-3 text-sm leading-relaxed text-[#3C4043]"
          >
            <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#1a73e8]">
              <Sparkles className="h-3 w-3" /> Relvion
            </span>
            {AGENT_TEASERS[idx].reply}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Branding copy block (animated intro) ────────────── */

export function BrandingStoryLine({ variant }: { variant: 'stats' | 'problem' | 'product' | 'features' | 'cta' }) {
  const copy: Record<typeof variant, React.ReactNode> = {
    stats: (
      <>
        Relvion isn&apos;t another inbox skin — it&apos;s a workspace that{' '}
        <span className="font-semibold text-[#202124]">honors how you actually think</span>, morning to evening.
      </>
    ),
    problem: (
      <>
        You shouldn&apos;t need a PhD in Gmail to feel on top of your day. Relvion brings{' '}
        <span className="font-semibold text-[#202124]">calm, clarity, and speed</span> to the tools you already trust.
      </>
    ),
    product: (
      <>
        Inbox, calendar, and assistant — woven together so you never lose the thread of{' '}
        <span className="font-semibold text-[#202124]">what you were doing</span>.
      </>
    ),
    features: (
      <>
        Every detail exists for one feeling:{' '}
        <span className="font-semibold text-[#202124]">&ldquo;I&apos;m in control of my day.&rdquo;</span>
      </>
    ),
    cta: (
      <>
        Join builders who traded tab chaos for a workspace that{' '}
        <span className="font-semibold text-[#202124]">feels like it was made for them</span>.
      </>
    ),
  };

  return (
    <BlurFade>
      <p className={cn('mt-4 max-w-2xl text-base leading-relaxed text-[#5F6368]', variant === 'stats' && 'mx-auto text-center')}>
        {copy[variant]}
      </p>
    </BlurFade>
  );
}
