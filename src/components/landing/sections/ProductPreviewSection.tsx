'use client';

import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Bot, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam';
import { Card3D } from '@/components/ui/card-3d';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { LandingIllustration } from '@/components/landing/illustrations/LandingIllustration';
import { landingSurface, landingText, type LandingTone } from '../theme';

const TAG_STYLES: Record<string, string> = {
  Urgent: 'bg-[#FCE8E6] text-[#EA4335] border-[#FCE8E6]',
  Review: 'bg-[#FEF7E0] text-[#E37400] border-[#FEF7E0]',
  Personal: 'bg-[#E6F4EA] text-[#34A853] border-[#E6F4EA]',
  Low: 'bg-[#F8F9FA] text-[#5F6368] border-[#E8EAED]',
};

const TAB_ILLUSTRATIONS = {
  inbox: 'inbox' as const,
  calendar: 'calendar' as const,
  agent: 'agent' as const,
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 140, damping: 18 } },
};

type ProductTab = {
  id: 'inbox' | 'calendar' | 'agent';
  label: string;
  icon: typeof Inbox;
  headline: string;
  copy: string;
  rows?: readonly { from: string; subject: string; tag: string; unread: boolean }[];
  events?: readonly { time: string; title: string; type: string }[];
  messages?: readonly { role: string; text: string }[];
};

export function ProductPreviewSection({
  tone,
  tabs,
}: {
  tone: LandingTone;
  tabs: readonly ProductTab[];
}) {
  const [active, setActive] = useState<ProductTab['id']>('inbox');
  const tab = tabs.find((t) => t.id === active)!;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card3D containerClassName="w-full">
        <div className={cn('relative overflow-hidden rounded-2xl border', landingSurface(tone, 'card'))}>
          <BorderBeam size={220} duration={10} colorFrom="#4285F4" colorTo="#34A853" />

          <div className="flex items-center gap-2 border-b border-[#E8EAED] bg-[#F8F9FA] px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EA4335]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBC04]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" />
            <motion.span
              className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-[#34A853]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
              Synced
            </motion.span>
          </div>

          <div className="relative flex gap-1 border-b border-[#E8EAED] p-2">
            <LayoutGroup>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={cn(
                    'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors sm:flex-none sm:px-4',
                    active === t.id ? 'text-white' : landingText(tone, 'muted')
                  )}
                >
                  {active === t.id && (
                    <motion.span
                      layoutId="product-tab-pill"
                      className="absolute inset-0 rounded-xl bg-[#1a73e8] shadow-md"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <t.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{t.label}</span>
                </button>
              ))}
            </LayoutGroup>
          </div>

          <div className="relative p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <h3 className={cn('text-lg font-semibold', landingText(tone, 'primary'))}>{tab.headline}</h3>
                <p className={cn('mt-1 text-sm', landingText(tone, 'muted'))}>{tab.copy}</p>

                {active === 'agent' && (
                  <p className={cn('mt-3 font-mono text-xs', landingText(tone, 'subtle'))}>
                    <TypewriterEffect
                      words={[
                        { text: 'Summarize my urgent threads...' },
                        { text: 'Draft a reply to Sarah...' },
                        { text: 'Schedule 30 min Thursday...' },
                      ]}
                    />
                  </p>
                )}

                <motion.div
                  className="mt-5 space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  key={`list-${active}`}
                >
                  {active === 'inbox' &&
                    tab.rows?.map((row, i) => (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        whileHover={{ scale: 1.01, x: 6 }}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-4 py-3',
                          row.unread
                            ? 'border-[#A8C7FA] bg-[#E8F0FE]/90'
                            : 'border-[#E8EAED] bg-white'
                        )}
                      >
                        <motion.div
                          className={cn('h-2 w-2 shrink-0 rounded-full', row.unread ? 'bg-[#EA4335]' : 'bg-transparent')}
                          animate={row.unread ? { scale: [1, 1.3, 1] } : undefined}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={cn('truncate text-sm font-medium', landingText(tone, 'primary'))}>{row.from}</p>
                          <p className={cn('truncate text-xs', landingText(tone, 'muted'))}>{row.subject}</p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            TAG_STYLES[row.tag] ?? TAG_STYLES.Low
                          )}
                        >
                          {row.tag}
                        </span>
                      </motion.div>
                    ))}

                  {active === 'calendar' &&
                    tab.events?.map((ev, i) => (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        whileHover={{ x: 8 }}
                        className="flex items-center gap-4 rounded-xl border border-[#E8EAED] bg-white px-4 py-3"
                      >
                        <span className="w-16 shrink-0 rounded-lg bg-[#E8F0FE] py-1 text-center text-xs font-mono font-semibold text-[#1a73e8]">
                          {ev.time}
                        </span>
                        <div className="flex-1">
                          <p className={cn('text-sm font-medium', landingText(tone, 'primary'))}>{ev.title}</p>
                        </div>
                        <span className={cn('text-xs font-medium text-[#34A853]')}>{ev.type}</span>
                      </motion.div>
                    ))}

                  {active === 'agent' &&
                    tab.messages?.map((msg, i) => (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        className={cn(
                          'rounded-xl px-4 py-3 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'ml-6 bg-[#F8F9FA] text-[#5F6368]'
                            : 'mr-4 border border-[#A8C7FA] bg-[#E8F0FE] text-[#202124]'
                        )}
                      >
                        {msg.role === 'agent' && (
                          <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#1a73e8]">
                            <Bot className="h-3 w-3" /> Relvion Agent
                          </span>
                        )}
                        {msg.text}
                      </motion.div>
                    ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Card3D>

      <motion.div
        key={active}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden lg:block"
      >
        <LandingIllustration
          id={TAB_ILLUSTRATIONS[active]}
          isDark={false}
          frame
          float
          interactive
        />
      </motion.div>
    </div>
  );
}
