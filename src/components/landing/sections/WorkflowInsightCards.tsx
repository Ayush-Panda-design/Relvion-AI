'use client';

import { motion } from 'framer-motion';
import { Bot, Calendar, Inbox, Sparkles } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { FlipWords } from '@/components/ui/flip-words';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: Inbox,
    title: 'Arrives in Gmail',
    body: 'Relvion ingests the thread via secure OAuth — nothing is migrated out of Google.',
    color: '#EA4335',
    bg: '#FCE8E6',
  },
  {
    icon: Sparkles,
    title: 'Agent summarizes & drafts',
    body: 'Gemini ranks urgency, suggests replies in your tone, and flags what needs you today.',
    color: '#4285F4',
    bg: '#E8F0FE',
  },
  {
    icon: Calendar,
    title: 'Schedule without leaving',
    body: 'Turn a scheduling email into a calendar hold, invite attendees, and sync back to Gmail.',
    color: '#34A853',
    bg: '#E6F4EA',
  },
  {
    icon: Bot,
    title: 'Done from one surface',
    body: 'Archive, follow up, or ask the agent for the next step — no tab circus.',
    color: '#E37400',
    bg: '#FEF7E0',
  },
];

export function WorkflowInsightCards() {
  return (
    <div className="mt-10">
      <BlurFade>
        <p className="text-base text-[#5F6368]">
          One email becomes{' '}
          <FlipWords
            words={['a draft', 'a meeting', 'inbox zero', 'a follow-up']}
            className="font-semibold text-[#1a73e8]"
            duration={3200}
          />{' '}
          without leaving Relvion.
        </p>
      </BlurFade>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <BlurFade key={step.title} delay={0.08 + i * 0.06}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex gap-4 rounded-2xl border border-[#E8EAED]/80 bg-white/80 p-4 shadow-sm"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: step.bg, color: step.color }}
              >
                <step.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#202124]">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5F6368]">{step.body}</p>
              </div>
            </motion.div>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}
