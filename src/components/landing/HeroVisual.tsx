'use client';

import { motion } from 'framer-motion';
import { Mail, Calendar, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Premium 3D-style Relvion AI hero — inbox + calendar + agent */
export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={cn('relative mx-auto aspect-square w-full max-w-[420px]', className)}>
      {/* Ambient glow */}
      <div className="absolute inset-[8%] rounded-full bg-orange-600/20 blur-[80px]" />
      <div className="absolute inset-[20%] rounded-full bg-amber-400/10 blur-[60px]" />

      {/* Curved ribbon text — decorative */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
        viewBox="0 0 400 400"
        aria-hidden
      >
        <defs>
          <path id="ribbon-a" d="M 30 200 Q 200 60 370 200" fill="none" />
          <path id="ribbon-b" d="M 30 220 Q 200 340 370 220" fill="none" />
        </defs>
        <text className="fill-white text-[9px] font-semibold uppercase tracking-[0.35em]">
          <textPath href="#ribbon-a">Gmail · Calendar · AI agent · One workspace</textPath>
        </text>
        <text className="fill-orange-400/60 text-[9px] font-semibold uppercase tracking-[0.35em]">
          <textPath href="#ribbon-b">Triage faster · Draft smarter · Ship replies</textPath>
        </text>
      </svg>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex h-full w-full items-center justify-center"
      >
        {/* Agent body */}
        <div className="relative">
          {/* Gradient ring (helpAI-style face border) */}
          <div
            className="absolute -inset-3 rounded-[2rem] opacity-90 blur-sm"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #ea580c, #f97316, #fdba74)',
            }}
          />
          <div className="relative flex h-44 w-44 flex-col items-center justify-center rounded-[1.75rem] border-4 border-[#1a1a1a] bg-gradient-to-b from-[#c2410c] to-[#9a3412] shadow-2xl sm:h-52 sm:w-52">
            {/* Face screen */}
            <div className="relative mb-3 flex h-20 w-28 items-center justify-center rounded-2xl border-2 border-black/40 bg-[#0a0a0a] sm:h-24 sm:w-32">
              <div className="flex gap-4">
                <motion.span
                  animate={{ scaleY: [1, 0.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="h-3 w-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                />
                <motion.span
                  animate={{ scaleY: [1, 0.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: 0.1 }}
                  className="h-3 w-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                />
              </div>
              <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-amber-300" />
            </div>
            {/* Chest panel */}
            <div className="flex gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="h-2 w-2 rounded-full bg-orange-300" />
              <span className="h-2 w-2 rounded-full bg-orange-300" />
            </div>
          </div>

          {/* Floating workspace chips */}
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -left-16 top-8 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#141414]/90 px-3 py-2 shadow-xl backdrop-blur-md sm:-left-20"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/20">
              <Mail className="h-4 w-4 text-orange-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-semibold text-stone-200">Inbox</p>
              <p className="text-[9px] text-stone-500">Priority triage</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0], rotate: [2, -2, 2] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
            className="absolute -right-14 top-20 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#141414]/90 px-3 py-2 shadow-xl backdrop-blur-md sm:-right-18"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20">
              <Calendar className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-semibold text-stone-200">Calendar</p>
              <p className="text-[9px] text-stone-500">Schedule in-thread</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-orange-500/30 bg-orange-600/15 px-4 py-2 backdrop-blur-sm"
          >
            <Bot className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-medium text-orange-200">Relvion Agent</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
