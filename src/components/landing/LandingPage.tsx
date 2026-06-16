"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Calendar,
  ChevronDown,
  Command,
  Inbox,
  Mail,
  Sparkles,
  Filter,
  PenLine,
  BarChart3,
  Users,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth/session";
import { BlurFade } from "@/components/ui/blur-fade";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { BorderBeam } from "@/components/ui/border-beam";
import { Card3D } from "@/components/ui/card-3d";
import { BrandMark } from "@/components/brand/BrandMark";
import { WorkflowDiagram, ArchitectureDiagram, BeforeAfterFlow } from "@/components/landing/visuals/Diagrams";
import { ImageShowcase, FeatureImage, DayInLifeDiagram } from "@/components/landing/visuals/Showcase";
import { HeroSection } from "@/components/landing/HeroSection";
import {
  landingSurface,
  landingText,
  landingSectionBg,
  primaryButton,
  sectionLabel,
  type LandingTone,
} from "./theme";
import { LandingNav } from "./LandingNav";
import {
  AgentSandbox,
  SecuritySection,
  ComparisonTable,
  PricingSection,
  TeamSocialProof,
  ChangelogSection,
  ChangelogFloatingWidget,
} from "./sections/ExtendedSections";
import { PainPointsSection } from "./sections/PainPointsSection";
import { ProductPreviewSection } from "./sections/ProductPreviewSection";
import { KeyboardShortcutsSection } from "./sections/KeyboardShortcutsSection";

import { SectionFloatingOrbs } from "@/components/landing/motion/SectionFloatingOrbs";
import { LandingIllustration } from "@/components/landing/illustrations/LandingIllustration";

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#compare", label: "Compare" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
];

const marqueeItems = [
  "Gmail sync",
  "Google Calendar",
  "AI triage",
  "Smart drafts",
  "Command palette",
  "Keyboard shortcuts",
  "Thread search",
  "Event scheduling",
  "Analytics",
  "Multi-account",
];

const painPoints = [
  {
    problem: "Context switching kills momentum",
    detail: "Email in one tab, calendar in another, notes somewhere else.",
    solution: "One workspace where threads and events share the same context.",
  },
  {
    problem: "Important messages get buried",
    detail: "Urgent requests sit under newsletters and automated alerts.",
    solution: "Relvion surfaces priority threads before you start scrolling.",
  },
  {
    problem: "Writing the same replies twice",
    detail: "Scheduling, follow-ups, and status updates eat your afternoon.",
    solution: "The agent drafts in your voice — you review and send.",
  },
];

const productTabs = [
  {
    id: "inbox",
    label: "Inbox",
    icon: Inbox,
    headline: "Triage without the chaos",
    copy: "Threads grouped by urgency, sender, and intent. Star, archive, or reply — all from one list.",
    rows: [
      { from: "Sarah Chen", subject: "Q2 roadmap review — need your input", tag: "Urgent", unread: true },
      { from: "Design Team", subject: "Final mockups attached for Relvion", tag: "Review", unread: true },
      { from: "Alex Morgan", subject: "Coffee next Tuesday?", tag: "Personal", unread: false },
      { from: "Notion", subject: "Your weekly digest", tag: "Low", unread: false },
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    headline: "Schedule from your inbox",
    copy: "Turn email threads into events. See your day beside your messages — no tab hopping.",
    events: [
      { time: "9:00 AM", title: "Standup with product", type: "Meeting" },
      { time: "11:30 AM", title: "Investor check-in", type: "Call" },
      { time: "2:00 PM", title: "Design review", type: "Focus" },
      { time: "4:30 PM", title: "Reply block — priority inbox", type: "Task" },
    ],
  },
  {
    id: "agent",
    label: "Agent",
    icon: Bot,
    headline: "Ask. Act. Done.",
    copy: "Natural language commands for the work you repeat every day.",
    messages: [
      { role: "user", text: "Summarize unread from Sarah and draft a reply." },
      { role: "agent", text: "Sarah wants Q2 roadmap feedback by Friday. I've drafted a concise reply acknowledging the timeline and requesting the doc link." },
      { role: "user", text: "Schedule 30 min with her Thursday afternoon." },
      { role: "agent", text: "Done. Thursday 3:30 PM — invite sent to Sarah Chen." },
    ],
  },
] as const;

const featureRows = [
  {
    icon: Filter,
    eyebrow: "Smart triage",
    title: "Your inbox, sorted before you open it",
    body: "Relvion reads sender history, deadlines, and thread sentiment to rank what needs you now. Newsletters and automated noise sink to the bottom automatically.",
    bullets: ["Priority scoring on every thread", "Batch archive for low-signal mail", "Custom rules per label and domain"],
  },
  {
    icon: PenLine,
    eyebrow: "AI drafts",
    title: "Replies that sound like you wrote them",
    body: "The agent studies your past tone — formal with clients, casual with teammates — and produces drafts you can send in one click or edit inline.",
    bullets: ["Context-aware reply suggestions", "Follow-up reminders built in", "Multi-language support"],
  },
  {
    icon: Command,
    eyebrow: "Command palette",
    title: "Everything one keystroke away",
    body: "Inspired by the fastest productivity tools: search threads, jump to calendar, trigger agent actions, and navigate the entire app without touching your mouse.",
    bullets: ["⌘K to open anywhere", "Fuzzy search across mail & events", "Custom shortcut bindings"],
  },
  {
    icon: BarChart3,
    eyebrow: "Analytics",
    title: "Understand how you communicate",
    body: "See response times, busiest hours, and which senders dominate your attention — so you can protect focus and set better boundaries.",
    bullets: ["Weekly communication digest", "Response time trends", "Focus time recommendations"],
  },
];

const shortcuts = [
  { keys: ["⌘", "K"], action: "Command palette" },
  { keys: ["E"], action: "Archive thread" },
  { keys: ["R"], action: "Reply" },
  { keys: ["C"], action: "Compose" },
  { keys: ["G", "I"], action: "Go to inbox" },
  { keys: ["/"], action: "Search" },
];

const useCaseIllustrations = ['team', 'inbox', 'agent'] as const;

const useCases = [
  {
    icon: Users,
    role: "Founders",
    text: "Investor updates, hiring threads, and calendar conflicts — handled from one surface while you build.",
  },
  {
    icon: Mail,
    role: "Operators",
    text: "High-volume inboxes with SLAs. Triage faster, draft quicker, never miss a critical follow-up.",
  },
  {
    icon: Sparkles,
    role: "Creators",
    text: "Brand deals, collaboration requests, and scheduling — organized without a separate CRM.",
  },
];

const steps = [
  { num: "01", title: "Connect Google", desc: "One sign-in links Gmail and Calendar. Your data stays in your account — Relvion reads through secure OAuth." },
  { num: "02", title: "Set your preferences", desc: "Tell Relvion how you work: priority senders, quiet hours, reply tone, and triage rules." },
  { num: "03", title: "Let the agent assist", desc: "Ask questions, request drafts, schedule meetings. The agent acts inside your workspace — not a separate chat window." },
  { num: "04", title: "Own your rhythm", desc: "Keyboard shortcuts, command palette, and analytics help you spend less time in email and more on what matters." },
];

const faqs = [
  { q: "Is Relvion a replacement for Gmail?", a: "No — Relvion is a workspace layer on top of Gmail and Google Calendar. Your mail stays in Google; Relvion gives you a faster, smarter interface and AI assistant." },
  { q: "How does the AI agent access my email?", a: "Through Google OAuth with scoped permissions. The agent only reads and acts on what you authorize, and drafts always require your approval before sending." },
  { q: "Can I use keyboard shortcuts exclusively?", a: "Yes. Relvion is built keyboard-first. The command palette (⌘K) exposes every action, and you can navigate inbox, calendar, and agent without a mouse." },
  { q: "Is early access free?", a: "Early access is free while we're in beta. We'll announce pricing well before any changes, with grandfathered rates for founding users." },
  { q: "What integrations are supported?", a: "Gmail and Google Calendar at launch. More integrations are on the roadmap based on community feedback." },
];

const testimonials = [
  { quote: "I stopped living in five tabs. Relvion is the first mail client that actually respects how I think.", name: "Jordan Lee", role: "Head of Product" },
  { quote: "The agent drafts are eerily accurate. I edit maybe one sentence and hit send.", name: "Maya Okonkwo", role: "Startup founder" },
  { quote: "Command palette alone saved me an hour a day. Everything else is a bonus.", name: "Chris Hart", role: "Engineering lead" },
  { quote: "Calendar and inbox in one view changed how I plan my mornings completely.", name: "Priya Sharma", role: "Operations lead" },
  { quote: "Finally an AI tool that stays inside my workflow instead of another tab.", name: "Tom Ellis", role: "Design director" },
];

/* ─── Sub-components ───────────────────────────────────── */

function Marquee({ tone }: { tone: LandingTone }) {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className={cn("relative overflow-hidden border-y py-4", landingSectionBg("gray"))}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#F8F9FA] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#F8F9FA] to-transparent" />
      <motion.div
        className="flex w-max gap-10"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <motion.span
            key={`${item}-${i}`}
            initial={{ opacity: 0.6 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={cn("flex items-center gap-10 text-sm font-medium whitespace-nowrap", landingText(tone, "muted"))}
          >
            {item}
            <motion.span
              className="text-[#34A853]"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: (i % marqueeItems.length) * 0.15 }}
            >
              ·
            </motion.span>
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

function FAQItem({ q, a, tone }: { q: string; a: string; tone: LandingTone }) {
  const isDark = false;
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border-b", isDark ? "border-white/[0.06]" : "border-stone-300/60")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className={cn("text-base font-medium", landingText(tone, "primary"))}>{q}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform text-[#1a73e8]", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <p className={cn("pb-5 text-sm leading-relaxed", landingText(tone, "muted"))}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────── */

export default function LandingPage({ session }: { session: SessionPayload | null }) {
  const [activeShortcut, setActiveShortcut] = useState(0);
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  const ctaHref = session ? "/dashboard" : "/signin";
  const ctaLabel = session ? "Open Dashboard" : "Sign In with Google";

  const isDark = false;
  const tone = "light" as const;

  return (
    <div suppressHydrationWarning className="relative min-h-screen scroll-pt-20 overflow-x-hidden bg-white">
      <LandingNav session={!!session} ctaHref={ctaHref} ctaLabel={ctaLabel} />

      <HeroSection ctaHref={ctaHref} ctaLabel={ctaLabel} />

      <Marquee tone="light" />

      <PainPointsSection items={painPoints} />


      {/* Visual showcase */}
<section className={cn("relative z-10 border-y py-20", landingSectionBg("white"))}>
        <SectionFloatingOrbs />
        <div className="relative mx-auto max-w-6xl px-6">
          <BlurFade>
            <p className={sectionLabel(tone)}>See it in action</p>
            <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(tone, "primary"))}>
              Every surface, one workspace.
            </h2>
            <p className={cn("mt-4 max-w-2xl text-lg", landingText(tone, "muted"))}>
              Click through real workflow views — inbox triage, calendar sync, agent actions, and analytics.
            </p>
          </BlurFade>
          <BlurFade delay={0.15} className="mt-10">
            <ImageShowcase isDark={isDark} activeIndex={showcaseIndex} onSelect={setShowcaseIndex} />
          </BlurFade>
        </div>
      </section>

      {/* Workflow diagrams */}
      <section id="workflow" className={cn("relative z-10 mx-auto max-w-6xl px-6 py-20", landingSectionBg("green"))}>
        <BlurFade>
          <p className={sectionLabel(tone)}>Workflow</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(tone, "primary"))}>
            From inbox to done — visually.
          </h2>
          <p className={cn("mt-4 max-w-2xl text-lg", landingText(tone, "muted"))}>
            See how a single email moves through Relvion, and how your day changes when everything lives in one pipeline.
          </p>
        </BlurFade>

        <BlurFade delay={0.1} className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <LandingIllustration id="workflow" isDark={isDark} frame float interactive />
          </motion.div>
        </BlurFade>

        <BlurFade delay={0.15} className="mt-10">
          <WorkflowDiagram isDark={isDark} />
        </BlurFade>

        <BlurFade delay={0.2} className="mt-10">
          <BeforeAfterFlow isDark={isDark} />
        </BlurFade>
      </section>


      {/* Architecture */}
<section className={cn("relative z-10 border-y py-20", landingSectionBg("cream"))}>
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade>
            <p className={sectionLabel(tone)}>Architecture</p>
            <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(tone, "primary"))}>
              How Relvion connects to your stack.
            </h2>
            <p className={cn("mt-4 max-w-2xl text-lg", landingText(tone, "muted"))}>
              Your data stays in Google. Relvion is the intelligent layer — triage, drafts, and scheduling without migrating your mail.
            </p>
          </BlurFade>
          <BlurFade delay={0.15} className="mt-12">
            <ArchitectureDiagram isDark={isDark} />
          </BlurFade>
        </div>
      </section>


      {/* Product deep-dive */}
<section id="product" className={cn("relative z-10 border-y py-20", landingSectionBg("gray"))}>
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade>
          <p className={sectionLabel(tone)}>Product</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(tone, "primary"))}>
            Three surfaces. One flow.
          </h2>
          <p className={cn("mt-4 max-w-2xl text-lg", landingText(tone, "muted"))}>
            Switch between inbox, calendar, and agent without losing context. Explore each module below.
          </p>
          </BlurFade>
          <BlurFade delay={0.15} className="mt-14">
            <ProductPreviewSection tone={tone} tabs={productTabs} />
          </BlurFade>
        </div>
      </section>
      <AgentSandbox isDark={isDark} />

      {/* Features */}
<section id="features" className={cn("relative z-10 mx-auto max-w-6xl px-6 py-20", landingSectionBg("blue"))}>
        <BlurFade>
          <p className={sectionLabel(tone)}>Features</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(tone, "primary"))}>
            Built for depth, not checkbox lists.
          </h2>
        </BlurFade>

        <div className="mt-16 space-y-24">
          {featureRows.map((row, i) => (
            <BlurFade key={row.title} delay={i * 0.08}>
            <article
              className={cn(
                "flex flex-col gap-10 lg:flex-row lg:items-center",
                i % 2 === 1 && "lg:flex-row-reverse"
              )}
            >
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                <div className="flex items-center gap-2 text-[#1a73e8]">
                  <row.icon className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">{row.eyebrow}</span>
                </div>
                <h3 className={cn("mt-3 text-2xl font-bold tracking-tight sm:text-3xl", landingText(tone, "primary"))}>
                  {row.title}
                </h3>
                <p className={cn("mt-4 text-base leading-relaxed", landingText(tone, "muted"))}>{row.body}</p>
                <ul className="mt-6 space-y-2">
                  {row.bullets.map((b, bi) => (
                    <motion.li
                      key={b}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: bi * 0.08 }}
                      className={cn("flex items-center gap-2 text-sm", landingText(tone, "muted"))}
                    >
                      <Check className="h-4 w-4 shrink-0 text-[#1a73e8]" />
                      {b}
                    </motion.li>
                  ))}
                </ul>
                </motion.div>
              </div>
              <Card3D containerClassName="flex-1">
                <FeatureImage eyebrow={row.eyebrow} isDark={isDark} />
              </Card3D>
            </article>
            </BlurFade>
          ))}
        </div>
      </section>


      <KeyboardShortcutsSection
        tone={tone}
        shortcuts={shortcuts}
        activeShortcut={activeShortcut}
        onSelect={setActiveShortcut}
      />
      <SecuritySection isDark={isDark} />
      <ComparisonTable isDark={isDark} />

      {/* Use cases */}
<section className={cn("mx-auto max-w-6xl px-6 py-20", landingSectionBg("green"))}>
        <p className={sectionLabel(tone)}>Use cases</p>
        <h2 className={cn("mt-3 text-3xl font-bold tracking-tight", landingText(tone, "primary"))}>
          Made for people with too much inbox.
        </h2>
        <div className="mt-12 flex flex-col gap-4">
          {useCases.map((uc, i) => (
            <BlurFade key={uc.role} delay={i * 0.1}>
            <TextRevealCard
              text={uc.text}
              revealText={`Built for ${uc.role.toLowerCase()} who need speed without sacrificing control.`}
              className={landingSurface(tone, "card")}
            >
              <div className="flex items-center gap-4">
                <div className="hidden w-24 shrink-0 sm:block">
                  <LandingIllustration
                    id={useCaseIllustrations[i]}
                    isDark={isDark}
                    frame={false}
                    float
                    interactive
                    compact
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1a73e8]/10 text-[#1a73e8] lg:hidden">
                    <uc.icon className="h-5 w-5" />
                  </div>
                  <h3 className={cn("font-semibold", landingText(tone, "primary"))}>{uc.role}</h3>
                </div>
              </div>
            </TextRevealCard>
            </BlurFade>
          ))}
        </div>
      </section>


      {/* How it works — vertical timeline */}
<section id="how-it-works" className={cn("border-t py-20", landingSectionBg("cream"))}>
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade>
            <p className={sectionLabel(tone)}>How it works</p>
            <h2 className={cn("mt-3 text-3xl font-bold tracking-tight", landingText(tone, "primary"))}>
              Live in four steps.
            </h2>
          </BlurFade>

          <div className="mt-14 flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1">
              <TracingBeam>
                <div className="space-y-12 pl-10">
                  {steps.map((step, i) => (
                    <BlurFade key={step.num} delay={i * 0.12}>
                    <motion.div
                      whileInView={{ scale: [0.98, 1] }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="relative flex gap-6"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#4285F4] bg-[#4285F4] text-sm font-bold text-white shadow-lg shadow-[#4285F4]/25"
                      >
                        {step.num}
                      </motion.div>
                      <div className="pt-1">
                        <h3 className={cn("text-lg font-semibold", landingText(tone, "primary"))}>{step.title}</h3>
                        <p className={cn("mt-2 text-sm leading-relaxed", landingText(tone, "muted"))}>{step.desc}</p>
                      </div>
                    </motion.div>
                    </BlurFade>
                  ))}
                </div>
              </TracingBeam>
            </div>
            <BlurFade delay={0.2} className="flex-1 lg:max-w-md">
              <DayInLifeDiagram isDark={isDark} />
            </BlurFade>
          </div>
        </div>
      </section>
      <PricingSection isDark={isDark} ctaHref={ctaHref} />
      <TeamSocialProof isDark={isDark} />

      {/* Testimonials */}
<section className={cn("relative z-10 mx-auto max-w-6xl overflow-hidden px-6 py-20", landingSectionBg("gray"))}>
        <BlurFade>
          <p className={sectionLabel(tone)}>Early users</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight", landingText(tone, "primary"))}>
            What people are saying.
          </h2>
        </BlurFade>
        <BlurFade delay={0.15} className="mt-10 space-y-5">
          <InfiniteMovingCards items={testimonials} direction="left" speed="slow" isDark={isDark} />
          <InfiniteMovingCards items={[...testimonials].reverse()} direction="right" speed="slow" isDark={isDark} />
        </BlurFade>
      </section>
      <ChangelogSection isDark={isDark} />

      {/* FAQ */}
<section id="faq" className={cn("border-t py-20", landingSectionBg("blue"))}>
        <div className="mx-auto max-w-2xl px-6">
          <p className={cn("text-center", sectionLabel(tone))}>FAQ</p>
          <h2 className={cn("mt-3 text-center text-3xl font-bold tracking-tight", landingText(tone, "primary"))}>
            Common questions
          </h2>
          <div className="mt-10">
            {faqs.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} tone={tone} />
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
<section className={cn("relative z-10 mx-auto max-w-6xl px-6 py-20", landingSectionBg("white"))}>
        <BlurFade>
        <div className={cn("relative overflow-hidden rounded-2xl border p-10 text-center sm:p-14", landingSurface(tone, "elevated"))}>
          <BorderBeam size={220} duration={12} delay={2} colorFrom="#4285F4" colorTo="#34A853" />
          <div className="mx-auto max-w-xs">
            <LandingIllustration id="connect" isDark={isDark} frame={false} float interactive />
          </div>
          <h2 className={cn("mt-4 text-3xl font-bold tracking-tight", landingText(tone, "primary"))}>
            Ready to reclaim your inbox?
          </h2>
          <p className={cn("mx-auto mt-3 max-w-md text-base", landingText(tone, "muted"))}>
            Join early access. Free during beta — founding members keep preferential pricing when we launch paid plans.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-8 inline-block">
          <Link href={ctaHref} className={primaryButton(tone)}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          </motion.div>
        </div>
        </BlurFade>
      </section>


      {/* Footer */}
<footer className={cn("border-t px-6 py-10", landingSectionBg("green"))}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark size={20} variant="light" />
              <span className="font-semibold text-[#202124]">Relvion AI</span>
            </div>
            <p className={cn("mt-2 max-w-xs text-sm", landingText(tone, "subtle"))}>
              Intelligent email and calendar workspace. Built for focus.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={cn("hover:text-[#1a73e8]", landingText(tone, "muted"))}>
                {l.label}
              </Link>
            ))}
            <Link href="/signin" className={cn("hover:text-[#1a73e8]", landingText(tone, "muted"))}>
              Sign In
            </Link>
          </div>
        </div>
        <p className={cn("mx-auto mt-8 max-w-6xl text-xs", landingText(tone, "subtle"))}>
          © {new Date().getFullYear()} Relvion AI. All rights reserved.
        </p>
      </footer>


      <ChangelogFloatingWidget isDark={false} />
    </div>
  );
}
