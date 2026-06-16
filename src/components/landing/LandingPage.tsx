"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Calendar,
  ChevronDown,
  Command,
  Inbox,
  Mail,
  Search,
  Sparkles,
  Clock,
  Filter,
  PenLine,
  BarChart3,
  Users,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/auth/session";
import { BlurFade } from "@/components/ui/blur-fade";
import { FlipWords } from "@/components/ui/flip-words";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import { Card3D } from "@/components/ui/card-3d";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { TextRevealCard } from "@/components/ui/text-reveal-card";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Meteors } from "@/components/ui/meteors";
import { BrandMark } from "@/components/brand/BrandMark";
import { WorkflowDiagram, ArchitectureDiagram, BeforeAfterFlow } from "@/components/landing/visuals/Diagrams";
import { ImageShowcase, FeatureImage, DayInLifeDiagram } from "@/components/landing/visuals/Showcase";
import {
  ghostButton,
  landingSurface,
  landingText,
  primaryButton,
  sectionLabel,
  type LandingTheme,
} from "./theme";
import { LandingNav } from "./LandingNav";
import {
  IntegrationGrid,
  AgentSandbox,
  SecuritySection,
  ComparisonTable,
  PricingSection,
  TeamSocialProof,
  ChangelogSection,
  ChangelogFloatingWidget,
} from "./sections/ExtendedSections";

/* ─── Data ─────────────────────────────────────────────── */

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#integrations", label: "Integrations" },
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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
};

/* ─── Sub-components ───────────────────────────────────── */

function Marquee({ isDark }: { isDark: boolean }) {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className={cn("overflow-hidden border-y py-4", isDark ? "border-white/[0.06]" : "border-stone-300/60")}>
      <motion.div
        className="flex w-max gap-10"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={cn("flex items-center gap-10 text-sm font-medium whitespace-nowrap", landingText(isDark, "muted"))}
          >
            {item}
            <span className="text-orange-600">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function ProductPreview({ isDark }: { isDark: boolean }) {
  const [active, setActive] = useState<(typeof productTabs)[number]["id"]>("inbox");
  const tab = productTabs.find((t) => t.id === active)!;
  const inboxTab = productTabs.find((t) => t.id === "inbox")!;
  const calendarTab = productTabs.find((t) => t.id === "calendar")!;
  const agentTab = productTabs.find((t) => t.id === "agent")!;

  return (
    <Card3D containerClassName="w-full">
      <div className={cn("relative overflow-hidden rounded-xl border", landingSurface(isDark, "card"))}>
        <BorderBeam size={180} duration={10} colorFrom="#ea580c" colorTo="#fdba74" />
        <div className={cn("relative flex gap-1 border-b p-2", isDark ? "border-white/[0.06]" : "border-stone-300/60")}>
          <LayoutGroup>
            {productTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  active === t.id ? "text-white" : landingText(isDark, "muted"),
                  active !== t.id && (isDark ? "hover:bg-white/5" : "hover:bg-stone-900/5")
                )}
              >
                {active === t.id && (
                  <motion.span
                    layoutId="product-tab-pill"
                    className="absolute inset-0 rounded-lg bg-orange-600"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
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
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className={cn("text-lg font-semibold", landingText(isDark, "primary"))}>{tab.headline}</h3>
              <p className={cn("mt-1 text-sm", landingText(isDark, "muted"))}>{tab.copy}</p>

              {active === "agent" && (
                <p className={cn("mt-3 font-mono text-xs", landingText(isDark, "subtle"))}>
                  <TypewriterEffect
                    words={[
                      { text: "Summarize my urgent threads..." },
                      { text: "Draft a reply to Sarah..." },
                      { text: "Schedule 30 min Thursday..." },
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
                {active === "inbox" &&
                  inboxTab.rows.map((row, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItem}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                        row.unread
                          ? isDark
                            ? "border-orange-600/30 bg-orange-600/5"
                            : "border-orange-300 bg-orange-50/80"
                          : isDark
                            ? "border-white/[0.04] bg-white/[0.02]"
                            : "border-stone-300/40 bg-[#f5f0e8]/50"
                      )}
                    >
                      <div className={cn("h-2 w-2 shrink-0 rounded-full", row.unread ? "bg-orange-500" : "bg-transparent")} />
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-medium", landingText(isDark, "primary"))}>{row.from}</p>
                        <p className={cn("truncate text-xs", landingText(isDark, "muted"))}>{row.subject}</p>
                      </div>
                      <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", isDark ? "bg-white/5 text-stone-400" : "bg-stone-200 text-stone-600")}>
                        {row.tag}
                      </span>
                    </motion.div>
                  ))}

                {active === "calendar" &&
                  calendarTab.events.map((ev, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItem}
                      whileHover={{ x: 6 }}
                      className={cn("flex items-center gap-4 rounded-lg border px-4 py-3", isDark ? "border-white/[0.04]" : "border-stone-300/40")}
                    >
                      <span className="w-16 shrink-0 text-xs font-mono text-orange-600">{ev.time}</span>
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", landingText(isDark, "primary"))}>{ev.title}</p>
                      </div>
                      <span className={cn("text-xs", landingText(isDark, "subtle"))}>{ev.type}</span>
                    </motion.div>
                  ))}

                {active === "agent" &&
                  agentTab.messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      variants={staggerItem}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.12 }}
                      className={cn(
                        "rounded-lg px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? isDark
                            ? "ml-8 bg-white/5 text-stone-300"
                            : "ml-8 bg-stone-200/60 text-stone-700"
                          : isDark
                            ? "mr-4 border border-orange-600/20 bg-orange-600/5 text-stone-200"
                            : "mr-4 border border-orange-200 bg-orange-50 text-stone-800"
                      )}
                    >
                      {msg.role === "agent" && (
                        <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-orange-600">
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
  );
}

function FAQItem({ q, a, isDark }: { q: string; a: string; isDark: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border-b", isDark ? "border-white/[0.06]" : "border-stone-300/60")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className={cn("text-base font-medium", landingText(isDark, "primary"))}>{q}</span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform text-orange-600", open && "rotate-180")} />
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
            <p className={cn("pb-5 text-sm leading-relaxed", landingText(isDark, "muted"))}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShortcutChip({
  keys,
  action,
  isDark,
  active,
  onClick,
}: {
  keys: string[];
  action: string;
  isDark: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
        active
          ? isDark
            ? "border-orange-600 bg-orange-600/10"
            : "border-orange-500 bg-orange-50"
          : isDark
            ? "border-white/[0.06] hover:border-white/15"
            : "border-stone-300/60 hover:border-stone-400"
      )}
    >
      <div className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className={cn(
              "rounded border px-2 py-0.5 font-mono text-xs",
              isDark ? "border-white/10 bg-white/5" : "border-stone-400/50 bg-[#f5f0e8]"
            )}
          >
            {k}
          </kbd>
        ))}
      </div>
      <span className={cn("text-sm", landingText(isDark, "muted"))}>{action}</span>
    </motion.button>
  );
}

/* ─── Main ─────────────────────────────────────────────── */

export default function LandingPage({ session }: { session: SessionPayload | null }) {
  const [theme, setTheme] = useState<LandingTheme>("dark");
  const [mounted, setMounted] = useState(false);
  const [activeShortcut, setActiveShortcut] = useState(0);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("relvion-landing-theme") as LandingTheme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("relvion-landing-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  const ctaHref = session ? "/dashboard" : "/signin";
  const ctaLabel = session ? "Open Dashboard" : "Sign In with Google";

  return (
    <div
      suppressHydrationWarning
      className={cn(
        "relative min-h-screen scroll-pt-20 overflow-x-hidden transition-colors duration-300",
        landingSurface(isDark, "page"),
        landingText(isDark, "primary")
      )}
    >
      <AnimatedGridPattern className={cn(isDark ? "opacity-40" : "opacity-25")} numSquares={28} />
      {isDark && <Meteors number={10} />}

      {/* Nav — fixed, always visible */}
      <LandingNav
        isDark={isDark}
        onThemeToggle={() => setTheme(isDark ? "light" : "dark")}
        session={!!session}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
      />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-8 lg:pt-12">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1">
            <BlurFade delay={0.1}>
              <p className={cn(sectionLabel(), "inline-flex rounded-full border px-3 py-1", isDark ? "border-orange-600/30" : "border-orange-300")}>
                <AnimatedShinyText className={isDark ? "text-stone-300" : "text-stone-700"}>
                  Early access · AI workspace
                </AnimatedShinyText>
              </p>
            </BlurFade>
            <BlurFade delay={0.2}>
              <h1 className={cn("mt-4 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]", landingText(isDark, "primary"))}>
                Email, calendar, and{" "}
                <FlipWords words={["intelligence.", "focus.", "clarity.", "momentum."]} />
                <br />
                Finally in one place.
              </h1>
            </BlurFade>
            <BlurFade delay={0.35}>
              <TextGenerateEffect
                words="Relvion is a focused workspace for people who live in their inbox. Triage faster, draft smarter, and schedule without leaving the thread."
                className={cn("mt-6 max-w-lg text-lg font-normal leading-relaxed", landingText(isDark, "muted"))}
                duration={0.35}
              />
            </BlurFade>
            <BlurFade delay={0.5}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href={ctaHref} className={primaryButton(isDark)}>
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <Link href="#product" className={ghostButton(isDark)}>
                See the product
              </Link>
            </div>
            </BlurFade>
            <BlurFade delay={0.65}>
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="text-2xl font-bold text-orange-600">
                  <NumberTicker value={2} suffix="×" />
                </dt>
                <dd className={cn("text-sm", landingText(isDark, "subtle"))}>Faster triage</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold text-orange-600">&lt;1s</dt>
                <dd className={cn("text-sm", landingText(isDark, "subtle"))}>Agent latency</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold text-orange-600">
                  <NumberTicker value={100} suffix="%" />
                </dt>
                <dd className={cn("text-sm", landingText(isDark, "subtle"))}>Keyboard navigable</dd>
              </div>
            </dl>
            </BlurFade>
          </div>

          <BlurFade delay={0.25} yOffset={24} className="flex-1 lg:max-w-xl">
            <ProductPreview isDark={isDark} />
          </BlurFade>
        </div>
      </section>

      <Marquee isDark={isDark} />

      {/* Pain points */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <BlurFade>
          <p className={sectionLabel()}>The problem</p>
          <h2 className={cn("mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
            Your tools weren&apos;t built for how you actually work.
          </h2>
        </BlurFade>
        <div className="mt-12 space-y-0">
          {painPoints.map((item, i) => (
            <BlurFade key={item.problem} delay={i * 0.1}>
            <motion.div
              whileInView={{ backgroundColor: isDark ? "rgba(234,88,12,0.03)" : "rgba(234,88,12,0.06)" }}
              className={cn(
                "flex flex-col gap-6 border-t py-10 transition-colors sm:flex-row sm:items-start sm:justify-between",
                isDark ? "border-white/[0.06]" : "border-stone-300/60"
              )}
            >
              <div className="flex max-w-md items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <X className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <h3 className={cn("font-semibold", landingText(isDark, "primary"))}>{item.problem}</h3>
                  <p className={cn("mt-1 text-sm", landingText(isDark, "muted"))}>{item.detail}</p>
                </div>
              </div>
              <div className="flex max-w-md items-start gap-4 sm:text-right">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 sm:order-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                </div>
                <p className={cn("text-sm leading-relaxed sm:order-1", landingText(isDark, "muted"))}>{item.solution}</p>
              </div>
            </motion.div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Visual showcase */}
      <section className={cn("relative z-10 border-y py-20", isDark ? "border-white/[0.06] bg-[#0d0d0d]" : "border-stone-300/60 bg-[#e8e2d8]/50")}>
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade>
            <p className={sectionLabel()}>See it in action</p>
            <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
              Every surface, one workspace.
            </h2>
            <p className={cn("mt-4 max-w-2xl text-lg", landingText(isDark, "muted"))}>
              Click through real workflow views — inbox triage, calendar sync, agent actions, and analytics.
            </p>
          </BlurFade>
          <BlurFade delay={0.15} className="mt-10">
            <ImageShowcase isDark={isDark} activeIndex={showcaseIndex} onSelect={setShowcaseIndex} />
          </BlurFade>
        </div>
      </section>

      <IntegrationGrid isDark={isDark} />

      {/* Workflow diagrams */}
      <section id="workflow" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <BlurFade>
          <p className={sectionLabel()}>Workflow</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
            From inbox to done — visually.
          </h2>
          <p className={cn("mt-4 max-w-2xl text-lg", landingText(isDark, "muted"))}>
            See how a single email moves through Relvion, and how your day changes when everything lives in one pipeline.
          </p>
        </BlurFade>

        <BlurFade delay={0.1} className="mt-12">
          <WorkflowDiagram isDark={isDark} />
        </BlurFade>

        <BlurFade delay={0.2} className="mt-10">
          <BeforeAfterFlow isDark={isDark} />
        </BlurFade>
      </section>

      {/* Architecture */}
      <section className={cn("relative z-10 border-y py-20", isDark ? "border-white/[0.06] bg-[#0d0d0d]" : "border-stone-300/60 bg-[#e8e2d8]/50")}>
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade>
            <p className={sectionLabel()}>Architecture</p>
            <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
              How Relvion connects to your stack.
            </h2>
            <p className={cn("mt-4 max-w-2xl text-lg", landingText(isDark, "muted"))}>
              Your data stays in Google. Relvion is the intelligent layer — triage, drafts, and scheduling without migrating your mail.
            </p>
          </BlurFade>
          <BlurFade delay={0.15} className="mt-12">
            <ArchitectureDiagram isDark={isDark} />
          </BlurFade>
        </div>
      </section>

      {/* Product deep-dive */}
      <section id="product" className={cn("relative z-10 border-y py-20", isDark ? "border-white/[0.06] bg-[#0d0d0d]" : "border-stone-300/60 bg-[#e8e2d8]/50")}>
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade>
          <p className={sectionLabel()}>Product</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
            Three surfaces. One flow.
          </h2>
          <p className={cn("mt-4 max-w-2xl text-lg", landingText(isDark, "muted"))}>
            Switch between inbox, calendar, and agent without losing context. Explore each module below.
          </p>
          </BlurFade>
          <BlurFade delay={0.15} className="mt-14">
            <ProductPreview isDark={isDark} />
          </BlurFade>
        </div>
      </section>

      <AgentSandbox isDark={isDark} />

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <BlurFade>
          <p className={sectionLabel()}>Features</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
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
                <div className="flex items-center gap-2 text-orange-600">
                  <row.icon className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">{row.eyebrow}</span>
                </div>
                <h3 className={cn("mt-3 text-2xl font-bold tracking-tight sm:text-3xl", landingText(isDark, "primary"))}>
                  {row.title}
                </h3>
                <p className={cn("mt-4 text-base leading-relaxed", landingText(isDark, "muted"))}>{row.body}</p>
                <ul className="mt-6 space-y-2">
                  {row.bullets.map((b, bi) => (
                    <motion.li
                      key={b}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: bi * 0.08 }}
                      className={cn("flex items-center gap-2 text-sm", landingText(isDark, "muted"))}
                    >
                      <Check className="h-4 w-4 shrink-0 text-orange-600" />
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

      {/* Interactive shortcuts */}
      <section className={cn("border-y py-20", isDark ? "border-white/[0.06] bg-[#0d0d0d]" : "border-stone-300/60 bg-[#e8e2d8]/50")}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            <div className="lg:w-2/5">
              <p className={sectionLabel()}>Keyboard-first</p>
              <h2 className={cn("mt-3 text-3xl font-bold tracking-tight", landingText(isDark, "primary"))}>
                Speed is a feature.
              </h2>
              <p className={cn("mt-4 text-base leading-relaxed", landingText(isDark, "muted"))}>
                Click a shortcut below to preview the action. Relvion is designed for people who keep their hands on the keyboard.
              </p>
              <motion.div
                key={activeShortcut}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className={cn("mt-6 flex items-center gap-2 rounded-lg border px-4 py-3", landingSurface(isDark, "card"))}
              >
                <Search className="h-4 w-4 text-orange-600" />
                <span className={cn("text-sm", landingText(isDark, "muted"))}>
                  {shortcuts[activeShortcut].action}
                </span>
                <span className="ml-auto font-mono text-xs text-orange-600">
                  {shortcuts[activeShortcut].keys.join(" ")}
                </span>
              </motion.div>
            </div>
            <div className="flex flex-1 flex-wrap gap-3">
              <LayoutGroup>
              {shortcuts.map((s, i) => (
                <motion.div key={s.action} layout whileTap={{ scale: 0.96 }}>
                <ShortcutChip
                  key={s.action}
                  keys={s.keys}
                  action={s.action}
                  isDark={isDark}
                  active={activeShortcut === i}
                  onClick={() => setActiveShortcut(i)}
                />
                </motion.div>
              ))}
              </LayoutGroup>
            </div>
          </div>
        </div>
      </section>

      <SecuritySection isDark={isDark} />

      <ComparisonTable isDark={isDark} />

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className={sectionLabel()}>Use cases</p>
        <h2 className={cn("mt-3 text-3xl font-bold tracking-tight", landingText(isDark, "primary"))}>
          Made for people with too much inbox.
        </h2>
        <div className="mt-12 flex flex-col gap-4">
          {useCases.map((uc, i) => (
            <BlurFade key={uc.role} delay={i * 0.1}>
            <TextRevealCard
              text={uc.text}
              revealText={`Built for ${uc.role.toLowerCase()} who need speed without sacrificing control.`}
              className={landingSurface(isDark, "card")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-600/10 text-orange-600">
                  <uc.icon className="h-5 w-5" />
                </div>
                <h3 className={cn("font-semibold", landingText(isDark, "primary"))}>{uc.role}</h3>
              </div>
            </TextRevealCard>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* How it works — vertical timeline */}
      <section id="how-it-works" className={cn("border-t py-20", isDark ? "border-white/[0.06] bg-[#0d0d0d]" : "border-stone-300/60 bg-[#e8e2d8]/50")}>
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade>
            <p className={sectionLabel()}>How it works</p>
            <h2 className={cn("mt-3 text-3xl font-bold tracking-tight", landingText(isDark, "primary"))}>
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
                        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-orange-600 bg-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-600/20"
                      >
                        {step.num}
                      </motion.div>
                      <div className="pt-1">
                        <h3 className={cn("text-lg font-semibold", landingText(isDark, "primary"))}>{step.title}</h3>
                        <p className={cn("mt-2 text-sm leading-relaxed", landingText(isDark, "muted"))}>{step.desc}</p>
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
      <section className="relative z-10 mx-auto max-w-6xl overflow-hidden px-6 py-20">
        <BlurFade>
          <p className={sectionLabel()}>Early users</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight", landingText(isDark, "primary"))}>
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
      <section id="faq" className={cn("border-t py-20", isDark ? "border-white/[0.06]" : "border-stone-300/60")}>
        <div className="mx-auto max-w-2xl px-6">
          <p className={cn("text-center", sectionLabel())}>FAQ</p>
          <h2 className={cn("mt-3 text-center text-3xl font-bold tracking-tight", landingText(isDark, "primary"))}>
            Common questions
          </h2>
          <div className="mt-10">
            {faqs.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} isDark={isDark} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <BlurFade>
        <div className={cn("relative overflow-hidden rounded-2xl border p-10 text-center sm:p-14", landingSurface(isDark, "elevated"))}>
          <BorderBeam size={220} duration={12} delay={2} />
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Clock className="mx-auto h-8 w-8 text-orange-600" />
          </motion.div>
          <h2 className={cn("mt-4 text-3xl font-bold tracking-tight", landingText(isDark, "primary"))}>
            Ready to reclaim your inbox?
          </h2>
          <p className={cn("mx-auto mt-3 max-w-md text-base", landingText(isDark, "muted"))}>
            Join early access. Free during beta — founding members keep preferential pricing when we launch paid plans.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-8 inline-block">
          <Link href={ctaHref} className={primaryButton(isDark)}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          </motion.div>
        </div>
        </BlurFade>
      </section>

      {/* Footer */}
      <footer className={cn("border-t px-6 py-10", isDark ? "border-white/[0.06]" : "border-stone-300/60")}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark size={20} variant={isDark ? "dark" : "light"} />
              <span className="font-semibold">Relvion AI</span>
            </div>
            <p className={cn("mt-2 max-w-xs text-sm", landingText(isDark, "subtle"))}>
              Intelligent email and calendar workspace. Built for focus.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={cn("hover:text-orange-600", landingText(isDark, "muted"))}>
                {l.label}
              </Link>
            ))}
            <Link href="/signin" className={cn("hover:text-orange-600", landingText(isDark, "muted"))}>
              Sign In
            </Link>
          </div>
        </div>
        <p className={cn("mx-auto mt-8 max-w-6xl text-xs", landingText(isDark, "subtle"))}>
          © {new Date().getFullYear()} Relvion AI. All rights reserved.
        </p>
      </footer>

      <ChangelogFloatingWidget isDark={isDark} />
    </div>
  );
}
