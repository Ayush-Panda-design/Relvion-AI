"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Calendar, Inbox, Mail, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeProps = {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  isDark: boolean;
  active?: boolean;
  delay?: number;
};

function FlowNode({ icon, label, sub, isDark, active, delay = 0 }: NodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border px-4 py-3 text-center transition-shadow",
        active
          ? "border-orange-600 bg-orange-600/10 shadow-lg shadow-orange-600/10"
          : isDark
            ? "border-white/10 bg-[#111111]"
            : "border-stone-300/70 bg-[#e8e2d8]"
      )}
    >
      {active && (
        <motion.span
          className="absolute -inset-px rounded-xl border border-orange-500/50"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", active ? "bg-orange-600 text-white" : "bg-orange-600/10 text-orange-600")}>
        {icon}
      </div>
      <span className={cn("text-xs font-semibold", isDark ? "text-stone-100" : "text-stone-900")}>{label}</span>
      {sub && <span className={cn("text-[10px]", isDark ? "text-stone-500" : "text-stone-500")}>{sub}</span>}
    </motion.div>
  );
}

function AnimatedArrow({ isDark, delay = 0 }: { isDark: boolean; delay?: number }) {
  return (
    <svg width="48" height="24" viewBox="0 0 48 24" className="hidden shrink-0 sm:block">
      <motion.path
        d="M2 12 H38 M32 6 L40 12 L32 18"
        fill="none"
        stroke={isDark ? "#ea580c" : "#c2410c"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function WorkflowDiagram({ isDark }: { isDark: boolean }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveStep((s) => (s + 1) % 5), 2400);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { icon: <Mail className="h-5 w-5" />, label: "Gmail arrives", sub: "OAuth sync" },
    { icon: <Inbox className="h-5 w-5" />, label: "Smart triage", sub: "Priority rank" },
    { icon: <Sparkles className="h-5 w-5" />, label: "AI analysis", sub: "Intent detect" },
    { icon: <Bot className="h-5 w-5" />, label: "Agent acts", sub: "Draft & schedule" },
    { icon: <Send className="h-5 w-5" />, label: "You approve", sub: "One-click send" },
  ];

  return (
    <div className={cn("rounded-2xl border p-6 sm:p-8", isDark ? "border-white/[0.08] bg-[#0d0d0d]" : "border-stone-300/70 bg-[#ebe4d9]")}>
      <p className={cn("mb-6 text-center text-sm font-medium", isDark ? "text-stone-400" : "text-stone-600")}>
        End-to-end email workflow — click any step or watch it animate
      </p>
      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-between">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center gap-4 lg:flex-row">
            <button type="button" onClick={() => setActiveStep(i)} className="w-full lg:w-auto">
              <FlowNode {...step} isDark={isDark} active={activeStep === i} delay={i * 0.1} />
            </button>
            {i < steps.length - 1 && <AnimatedArrow isDark={isDark} delay={0.2 + i * 0.1} />}
          </div>
        ))}
      </div>
      <motion.p
        key={activeStep}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("mt-6 text-center text-sm", isDark ? "text-orange-400" : "text-orange-700")}
      >
        Step {activeStep + 1}: {steps[activeStep].label} — {steps[activeStep].sub}
      </motion.p>
    </div>
  );
}

export function ArchitectureDiagram({ isDark }: { isDark: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border p-4 sm:p-8", isDark ? "border-white/[0.08] bg-[#111111]" : "border-stone-300/70 bg-[#e8e2d8]")}>
      <svg viewBox="0 0 720 380" className="w-full" aria-label="Relvion architecture diagram">
        <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <rect x="20" y="150" width="100" height="80" rx="12" fill={isDark ? "#1a1a1a" : "#f0ebe3"} stroke="#ea580c" strokeWidth="1.5" />
          <text x="70" y="185" textAnchor="middle" fill={isDark ? "#e7e5e4" : "#1c1917"} fontSize="12" fontWeight="600">You</text>
          <text x="70" y="205" textAnchor="middle" fill="#a8a29e" fontSize="10">Keyboard + UI</text>
        </motion.g>

        <motion.g initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <rect x="270" y="120" width="180" height="140" rx="16" fill={isDark ? "#0a0a0a" : "#f5f0e8"} stroke="#ea580c" strokeWidth="2" />
          <text x="360" y="155" textAnchor="middle" fill="#ea580c" fontSize="13" fontWeight="700">Relvion Workspace</text>
          <text x="360" y="178" textAnchor="middle" fill={isDark ? "#a8a29e" : "#57534e"} fontSize="10">Inbox · Calendar · Agent</text>
          <rect x="290" y="195" width="60" height="28" rx="6" fill="#ea580c20" stroke="#ea580c50" />
          <text x="320" y="213" textAnchor="middle" fill="#ea580c" fontSize="9">Triage</text>
          <rect x="360" y="195" width="60" height="28" rx="6" fill="#ea580c20" stroke="#ea580c50" />
          <text x="390" y="213" textAnchor="middle" fill="#ea580c" fontSize="9">Drafts</text>
          <rect x="290" y="232" width="130" height="28" rx="6" fill="#ea580c20" stroke="#ea580c50" />
          <text x="355" y="250" textAnchor="middle" fill="#ea580c" fontSize="9">Command Palette</text>
        </motion.g>

        <motion.g initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.35 }}>
          <rect x="530" y="60" width="120" height="70" rx="12" fill={isDark ? "#1a1a1a" : "#f0ebe3"} stroke={isDark ? "#44403c" : "#d6d3d1"} strokeWidth="1.5" />
          <text x="590" y="92" textAnchor="middle" fill={isDark ? "#e7e5e4" : "#1c1917"} fontSize="11" fontWeight="600">Gmail API</text>
          <text x="590" y="110" textAnchor="middle" fill="#a8a29e" fontSize="9">Threads & labels</text>
        </motion.g>

        <motion.g initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.45 }}>
          <rect x="530" y="160" width="120" height="70" rx="12" fill={isDark ? "#1a1a1a" : "#f0ebe3"} stroke={isDark ? "#44403c" : "#d6d3d1"} strokeWidth="1.5" />
          <text x="590" y="192" textAnchor="middle" fill={isDark ? "#e7e5e4" : "#1c1917"} fontSize="11" fontWeight="600">Google Calendar</text>
          <text x="590" y="210" textAnchor="middle" fill="#a8a29e" fontSize="9">Events & invites</text>
        </motion.g>

        <motion.g initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.55 }}>
          <rect x="530" y="260" width="120" height="70" rx="12" fill={isDark ? "#1a1a1a" : "#f0ebe3"} stroke="#ea580c" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="590" y="292" textAnchor="middle" fill="#ea580c" fontSize="11" fontWeight="600">Relvion Agent</text>
          <text x="590" y="310" textAnchor="middle" fill="#a8a29e" fontSize="9">Gemini-powered</text>
        </motion.g>

        {[
          { d: "M120 190 L270 190", delay: 0.3 },
          { d: "M450 155 L530 95", delay: 0.5 },
          { d: "M450 190 L530 195", delay: 0.6 },
          { d: "M450 235 L530 295", delay: 0.7 },
        ].map((line, i) => (
          <motion.path
            key={i}
            d={line.d}
            fill="none"
            stroke="#ea580c"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ delay: line.delay, duration: 0.9 }}
          />
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-600" /> Live sync</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-orange-600" /> AI layer</span>
        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-orange-600" /> OAuth secured</span>
      </div>
    </div>
  );
}

export function BeforeAfterFlow({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={cn("flex-1 rounded-2xl border p-6", isDark ? "border-red-900/30 bg-red-950/10" : "border-red-200 bg-red-50/50")}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-red-500">Before Relvion</p>
        <ul className={cn("mt-4 space-y-3 text-sm", isDark ? "text-stone-400" : "text-stone-600")}>
          {["5+ tabs open daily", "Missed follow-ups", "Manual scheduling", "No priority signal", "Context lost on switch"].map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="text-red-500">✕</span> {item}
            </motion.li>
          ))}
        </ul>
        <svg viewBox="0 0 200 80" className="mt-6 w-full opacity-60">
          <motion.path
            d="M10 60 Q50 10 100 40 T190 30"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
          />
          <text x="100" y="75" textAnchor="middle" fill="#ef4444" fontSize="9">Chaotic flow</text>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={cn("flex-1 rounded-2xl border p-6", isDark ? "border-emerald-900/30 bg-emerald-950/10" : "border-emerald-200 bg-emerald-50/50")}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">With Relvion</p>
        <ul className={cn("mt-4 space-y-3 text-sm", isDark ? "text-stone-400" : "text-stone-600")}>
          {["Single workspace", "Agent-drafted replies", "Calendar from threads", "AI priority inbox", "⌘K everything"].map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="text-emerald-500">✓</span> {item}
            </motion.li>
          ))}
        </ul>
        <svg viewBox="0 0 200 80" className="mt-6 w-full">
          <motion.path
            d="M10 40 H60 L80 20 L120 20 L140 40 H190"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          />
          <text x="100" y="65" textAnchor="middle" fill="#22c55e" fontSize="9">Structured pipeline</text>
        </svg>
      </motion.div>
    </div>
  );
}
