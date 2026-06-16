'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Calendar, Inbox, Mail, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WireframeIntegrationsIllustration } from '@/components/landing/illustrations/animated';
import { BorderBeam } from '@/components/ui/border-beam';

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
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-xl border px-4 py-3 text-center transition-shadow',
        active
          ? 'border-[#4285F4] bg-[#E8F0FE] shadow-lg shadow-[#4285F4]/10'
          : 'border-[#E8EAED] bg-white'
      )}
    >
      {active && (
        <motion.span
          className="absolute -inset-px rounded-xl border border-[#4285F4]/50"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          active ? 'bg-[#4285F4] text-white' : 'bg-[#E8F0FE] text-[#1a73e8]'
        )}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold text-[#202124]">{label}</span>
      {sub && <span className="text-[10px] text-[#5F6368]">{sub}</span>}
    </motion.div>
  );
}

function AnimatedArrow({ isDark, delay = 0 }: { isDark: boolean; delay?: number }) {
  return (
    <svg width="48" height="24" viewBox="0 0 48 24" className="hidden shrink-0 sm:block">
      <motion.path
        d="M2 12 H38 M32 6 L40 12 L32 18"
        fill="none"
        stroke="#4285F4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8, ease: 'easeInOut' }}
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
    { icon: <Mail className="h-5 w-5" />, label: 'Gmail arrives', sub: 'OAuth sync' },
    { icon: <Inbox className="h-5 w-5" />, label: 'Smart triage', sub: 'Priority rank' },
    { icon: <Sparkles className="h-5 w-5" />, label: 'AI analysis', sub: 'Intent detect' },
    { icon: <Bot className="h-5 w-5" />, label: 'Agent acts', sub: 'Draft & schedule' },
    { icon: <Send className="h-5 w-5" />, label: 'You approve', sub: 'One-click send' },
  ];

  return (
    <div className="rounded-2xl border border-[#E8EAED] bg-white p-6 shadow-sm sm:p-8">
      <p className="mb-6 text-center text-sm font-medium text-[#5F6368]">
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
        className="mt-6 text-center text-sm text-[#1a73e8]"
      >
        Step {activeStep + 1}: {steps[activeStep].label} — {steps[activeStep].sub}
      </motion.p>
    </div>
  );
}

const INTEGRATIONS = [
  { id: 'gmail', label: 'Gmail API', sub: 'Threads & labels', color: '#EA4335', bg: '#FCE8E6', y: 60 },
  { id: 'calendar', label: 'Google Calendar', sub: 'Events & invites', color: '#4285F4', bg: '#E8F0FE', y: 160 },
  { id: 'agent', label: 'Relvion Agent', sub: 'Gemini-powered', color: '#34A853', bg: '#E6F4EA', y: 260 },
];

export function ArchitectureDiagram({ isDark }: { isDark: boolean }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => (p + 1) % 3), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#E8EAED] bg-white p-3 shadow-lg">
        <BorderBeam size={160} duration={10} colorFrom="#34A853" colorTo="#4285F4" />
        <WireframeIntegrationsIllustration />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[#E8EAED] bg-gradient-to-br from-white via-[#F8F9FA] to-[#E8F0FE] p-4 shadow-md sm:p-6">
        <svg viewBox="0 0 720 380" className="w-full" aria-label="Relvion architecture diagram">
          <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <motion.rect
              x="20"
              y="150"
              width="100"
              height="80"
              rx="14"
              fill="#fff"
              stroke="#4285F4"
              strokeWidth="2"
              whileHover={{ scale: 1.03 }}
            />
            <text x="70" y="182" textAnchor="middle" fill="#202124" fontSize="12" fontWeight="700">
              You
            </text>
            <text x="70" y="202" textAnchor="middle" fill="#80868B" fontSize="10">
              Keyboard + UI
            </text>
          </motion.g>

          <motion.g
            initial={{ scale: 0.92, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <rect x="250" y="110" width="200" height="160" rx="20" fill="#E8F0FE" stroke="#4285F4" strokeWidth="2.5" />
            <text x="350" y="148" textAnchor="middle" fill="#1a73e8" fontSize="14" fontWeight="700">
              Relvion Workspace
            </text>
            <text x="350" y="168" textAnchor="middle" fill="#5F6368" fontSize="10">
              Inbox · Calendar · Agent
            </text>
            {[
              { x: 270, label: 'Triage', fill: '#E6F4EA', stroke: '#34A853', text: '#34A853' },
              { x: 350, label: 'Drafts', fill: '#FEF7E0', stroke: '#FBBC04', text: '#E37400' },
              { x: 270, y: 238, label: '⌘K Palette', fill: '#E8F0FE', stroke: '#4285F4', text: '#4285F4', w: 140 },
            ].map((chip, i) => (
              <motion.rect
                key={chip.label}
                x={chip.x}
                y={chip.y ?? 190}
                width={chip.w ?? 70}
                height="30"
                rx="8"
                fill={chip.fill}
                stroke={chip.stroke}
                animate={{ opacity: pulse === i % 3 ? [0.7, 1, 0.7] : 1 }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            ))}
            <text x="305" y="210" textAnchor="middle" fill="#34A853" fontSize="9" fontWeight="600">
              Triage
            </text>
            <text x="385" y="210" textAnchor="middle" fill="#E37400" fontSize="9" fontWeight="600">
              Drafts
            </text>
            <text x="340" y="258" textAnchor="middle" fill="#4285F4" fontSize="9" fontWeight="600">
              ⌘K Palette
            </text>
          </motion.g>

          {INTEGRATIONS.map((node, i) => (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12 }}
            >
              <motion.rect
                x="530"
                y={node.y}
                width="130"
                height="72"
                rx="14"
                fill={node.bg}
                stroke={node.color}
                strokeWidth={pulse === i ? 2.5 : 1.5}
                strokeDasharray={node.id === 'agent' ? '5 3' : undefined}
                animate={pulse === i ? { scale: [1, 1.02, 1] } : {}}
                style={{ transformOrigin: `${595}px ${node.y + 36}px` }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <circle cx="548" cy={node.y + 36} r="10" fill={node.color} />
              <text x="595" y={node.y + 32} textAnchor="middle" fill="#202124" fontSize="11" fontWeight="700">
                {node.label}
              </text>
              <text x="595" y={node.y + 50} textAnchor="middle" fill="#80868B" fontSize="9">
                {node.sub}
              </text>
            </motion.g>
          ))}

          {[
            { d: 'M120 190 L250 190', color: '#4285F4', delay: 0.25 },
            { d: 'M450 145 L530 96', color: '#EA4335', delay: 0.45 },
            { d: 'M450 190 L530 196', color: '#4285F4', delay: 0.55 },
            { d: 'M450 235 L530 296', color: '#34A853', delay: 0.65 },
          ].map((line, i) => (
            <g key={i}>
              <motion.path
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeOpacity="0.35"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ delay: line.delay, duration: 0.9 }}
              />
              <motion.circle
                r="4"
                fill={line.color}
                initial={{ offsetDistance: '0%' }}
                animate={{ offsetDistance: ['0%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: line.delay, ease: 'linear' }}
                style={{ offsetPath: `path('${line.d}')` }}
              />
            </g>
          ))}
        </svg>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-semibold uppercase tracking-widest text-[#80868B]">
          <motion.span className="flex items-center gap-1.5" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="h-2 w-2 rounded-full bg-[#34A853]" /> Live sync
          </motion.span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border-2 border-[#4285F4]" /> AI layer
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-[#EA4335]" /> OAuth secured
          </span>
        </div>
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
        className="flex-1 rounded-2xl border border-[#FCE8E6] bg-[#FCE8E6]/40 p-6"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[#EA4335]">Before Relvion</p>
        <ul className="mt-4 space-y-3 text-sm text-[#5F6368]">
          {['5+ tabs open daily', 'Missed follow-ups', 'Manual scheduling', 'No priority signal', 'Context lost on switch'].map(
            (item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2"
              >
                <span className="text-[#EA4335]">✕</span> {item}
              </motion.li>
            )
          )}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="flex-1 rounded-2xl border border-[#E6F4EA] bg-[#E6F4EA]/50 p-6"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-[#34A853]">With Relvion</p>
        <ul className="mt-4 space-y-3 text-sm text-[#5F6368]">
          {['Single workspace', 'Agent-drafted replies', 'Calendar from threads', 'AI priority inbox', '⌘K everything'].map(
            (item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2"
              >
                <span className="text-[#34A853]">✓</span> {item}
              </motion.li>
            )
          )}
        </ul>
      </motion.div>
    </div>
  );
}
