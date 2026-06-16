"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Check,
  X,
  Lock,
  Shield,
  EyeOff,
  Server,
  KeyRound,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  Webhook,
  Search,
  Sparkles,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import {
  landingSurface,
  landingText,
  landingSectionBg,
  sectionLabel,
  primaryButton,
} from "@/components/landing/theme";
import Link from "next/link";
import { LandingIllustration } from "@/components/landing/illustrations/LandingIllustration";
import { GradientAgentIllustration, GeometricSecurityIllustration } from "@/components/landing/illustrations/animated";

/* ─── Data ─────────────────────────────────────────────── */

const integrations = [
  { id: "gmail", name: "Gmail", status: "live" as const, icon: Mail, color: "#ea4335", desc: "Full inbox sync, compose, triage" },
  { id: "calendar", name: "Google Calendar", status: "live" as const, icon: Calendar, color: "#4285f4", desc: "Events, scheduling, invites" },
  { id: "oauth", name: "Google OAuth", status: "live" as const, icon: KeyRound, color: "#34a853", desc: "Secure scoped permissions" },
  { id: "vector", name: "Vector Search", status: "live" as const, icon: Search, color: "#ea580c", desc: "Semantic mail search" },
  { id: "webhooks", name: "Push Webhooks", status: "live" as const, icon: Webhook, color: "#8b5cf6", desc: "Real-time inbox updates" },
  { id: "slack", name: "Slack", status: "soon" as const, icon: MessageSquare, color: "#4a154b", desc: "Thread notifications" },
  { id: "notion", name: "Notion", status: "soon" as const, icon: FileText, color: "#f5f5f5", desc: "Notes & task sync" },
  { id: "agent", name: "Relvion Agent", status: "live" as const, icon: Bot, color: "#ea580c", desc: "Drafts, summaries, actions" },
];

const securityItems = [
  {
    icon: Lock,
    title: "OAuth-only access",
    body: "We never see your Google password. Permissions are scoped to what you approve — Gmail read/write and Calendar access only.",
    color: "#4285F4",
    bg: "#E8F0FE",
  },
  {
    icon: Shield,
    title: "Encryption in transit & at rest",
    body: "All API traffic uses TLS 1.3. Session tokens are signed and httpOnly. Credentials are stored encrypted server-side.",
    color: "#34A853",
    bg: "#E6F4EA",
  },
  {
    icon: EyeOff,
    title: "We never train on your mail",
    body: "Your emails are processed to power your workspace — not to train foundation models. Data stays tied to your account.",
    color: "#FBBC04",
    bg: "#FEF7E0",
  },
  {
    icon: Server,
    title: "Your data stays in Google",
    body: "Relvion is a workspace layer. Messages and events remain in Gmail and Google Calendar — we don't migrate or resell your data.",
    color: "#EA4335",
    bg: "#FCE8E6",
  },
];

const comparisonRows = [
  { feature: "Unified inbox + calendar + AI agent", relvion: true, gmail: false, superhuman: "partial" },
  { feature: "AI priority triage (Urgent / Important)", relvion: true, gmail: false, superhuman: true },
  { feature: "Command palette (⌘K / Ctrl+K)", relvion: true, gmail: false, superhuman: true },
  { feature: "Full keyboard shortcut suite", relvion: true, gmail: "partial", superhuman: true },
  { feature: "Semantic vector search", relvion: true, gmail: false, superhuman: false },
  { feature: "AI agent with file attachments", relvion: true, gmail: false, superhuman: false },
  { feature: "Real-time push sync (webhooks)", relvion: true, gmail: true, superhuman: true },
  { feature: "Communication analytics", relvion: true, gmail: false, superhuman: "partial" },
  { feature: "Resizable AI assistant panel", relvion: true, gmail: false, superhuman: false },
  { feature: "Free during beta", relvion: true, gmail: true, superhuman: false },
];

const pricingPlans = [
  {
    id: "beta",
    name: "Beta",
    price: "Free",
    period: "during early access",
    badge: "Current",
    highlight: true,
    features: [
      "Full Gmail & Calendar workspace",
      "AI triage & priority scoring",
      "Relvion Agent with file uploads",
      "Command palette & shortcuts",
      "Vector search & analytics",
      "Real-time webhook sync",
      "Grandfathered pricing at launch",
    ],
    cta: "Start free",
    ctaHref: "/signin",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "/mo · coming soon",
    badge: "Roadmap",
    highlight: false,
    features: [
      "Everything in Beta",
      "Advanced automation rules",
      "Team shared inboxes",
      "Custom triage models",
      "Priority support & SLA",
      "Slack & Notion integrations",
      "API access for workflows",
    ],
    cta: "Join waitlist",
    ctaHref: "/signin",
  },
  {
    id: "team",
    name: "Team",
    price: "$29",
    period: "/user/mo · coming soon",
    badge: "Roadmap",
    highlight: false,
    features: [
      "Everything in Pro",
      "Admin controls & audit logs",
      "SSO / SAML (enterprise)",
      "Dedicated onboarding",
      "Volume discounts",
      "Custom data retention",
      "SOC 2 report (in progress)",
    ],
    cta: "Contact us",
    ctaHref: "/signin",
  },
];

const teamLogos = [
  { quote: "Shipped our inbox workflow in a week.", name: "Nova Labs", role: "Series A startup" },
  { quote: "Replaced three tools with one workspace.", name: "Parallel", role: "Product team" },
  { quote: "Agent drafts cut reply time in half.", name: "Meridian", role: "Operations" },
  { quote: "Keyboard-first — our eng team loves it.", name: "Stackline", role: "Engineering" },
  { quote: "Calendar + mail finally in one view.", name: "Foundry Co", role: "Founders" },
  { quote: "Beta feedback shaped the roadmap.", name: "Cohort 21", role: "Early adopters" },
];

const changelogEntries = [
  { date: "Jun 2026", tag: "New", title: "Resizable AI assistant panel", desc: "Drag the agent sidebar to your preferred width — saved per device." },
  { date: "Jun 2026", tag: "New", title: "Copy prompts & responses", desc: "One-click copy on any agent message in the side panel." },
  { date: "Jun 2026", tag: "Improved", title: "Calendar redesign", desc: "Color-coded events, selected-day panel, and animated create/edit modals." },
  { date: "May 2026", tag: "New", title: "Gmail-style dashboard", desc: "Soft dark theme, density toggle, hover actions, and command palette." },
  { date: "May 2026", tag: "New", title: "Analytics page", desc: "Response trends, busiest hours, and communication insights." },
  { date: "May 2026", tag: "Improved", title: "Keyboard shortcuts", desc: "Global shortcuts for compose, navigation, and in-email actions." },
];

const sandboxCommands = [
  {
    prompt: "Summarize my urgent threads from today",
    response:
      "You have 2 urgent threads: Sarah Chen needs Q2 roadmap feedback by Friday, and Legal flagged a contract revision due EOD. I've ranked them by deadline — want me to draft replies?",
  },
  {
    prompt: "Draft a reply to Sarah about the roadmap",
    response:
      "Here's a draft:\n\nHi Sarah — thanks for sending this over. I'll review the Q2 roadmap doc and share feedback by Thursday EOD. Could you drop the link in the thread if it's not attached?\n\nBest",
  },
  {
    prompt: "Schedule 30 min with Sarah Thursday afternoon",
    response:
      "Done. I found a free slot Thursday 3:30–4:00 PM and sent a Google Calendar invite to Sarah Chen with the thread context attached.",
  },
  {
    prompt: "Archive all newsletters from this week",
    response:
      "Archived 14 low-priority threads (newsletters, digests, automated alerts). Your inbox now shows 8 threads that need attention.",
  },
];

function CellIcon({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-emerald-500" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-red-400/80" />;
  return <span className="text-xs font-medium text-[#1a73e8]">Partial</span>;
}

/* ─── Integration grid ─────────────────────────────────── */

export function IntegrationGrid({ isDark }: { isDark: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="integrations" className={cn("relative z-10 mx-auto max-w-6xl px-6 py-20", landingSectionBg(isDark))}>
      <div className="text-center">
        <p className={sectionLabel(isDark)}>Integrations</p>
        <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
          Plugs into the tools you already use.
        </h2>
        <p className={cn("mx-auto mt-4 max-w-2xl text-lg", landingText(isDark, "muted"))}>
          Gmail and Calendar are live today. More connectors are on the roadmap — hover to explore.
        </p>
        <div className="mx-auto mt-8 max-w-lg">
          <LandingIllustration id="integrations" isDark={isDark} frame float={false} />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {integrations.map((item, i) => {
          const Icon = item.icon;
          const isHovered = hovered === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
                landingSurface(isDark, "card"),
                isHovered && "scale-[1.02] shadow-lg shadow-[#4285F4]/10"
              )}
            >
              {isHovered && <BorderBeam size={120} duration={6} colorFrom="#ea580c" colorTo="#fdba74" />}
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: item.color === "#f5f5f5" ? (isDark ? "#e7e5e4" : "#44403c") : item.color }} />
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      item.status === "live"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-[#1a73e8]/15 text-[#1a73e8]"
                    )}
                  >
                    {item.status === "live" ? "Live" : "Soon"}
                  </span>
                </div>
                <h3 className={cn("mt-4 font-semibold", landingText(isDark, "primary"))}>{item.name}</h3>
                <p className={cn("mt-1 text-xs leading-relaxed", landingText(isDark, "muted"))}>{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Agent sandbox ────────────────────────────────────── */

export function AgentSandbox({ isDark }: { isDark: boolean }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [streaming, setStreaming] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const streamResponse = useCallback((fullText: string) => {
    setStreaming(true);
    setMessages((m) => [...m, { role: "agent", text: "" }]);
    let i = 0;
    if (streamRef.current) clearInterval(streamRef.current);
    streamRef.current = setInterval(() => {
      i += 2;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "agent", text: fullText.slice(0, i) };
        return copy;
      });
      if (i >= fullText.length) {
        if (streamRef.current) clearInterval(streamRef.current);
        setStreaming(false);
      }
    }, 18);
  }, []);

  useEffect(() => () => { if (streamRef.current) clearInterval(streamRef.current); }, []);

  const runCommand = (text: string) => {
    if (streaming) return;
    const match = sandboxCommands.find((c) => c.prompt.toLowerCase() === text.toLowerCase()) ?? sandboxCommands[0];
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => streamResponse(match.response), 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    runCommand(input.trim());
  };

  return (
    <section id="demo" className={cn("relative z-10 border-y py-20", landingSectionBg(isDark))}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          <div className="lg:w-2/5">
            <p className={sectionLabel(isDark)}>Live demo</p>
            <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
              Try the agent — no sign-in required.
            </h2>
            <p className={cn("mt-4 text-base leading-relaxed", landingText(isDark, "muted"))}>
              Type a command or pick a suggestion below. Responses are simulated to match the real Relvion Agent in your dashboard.
            </p>
            <div className="mt-6 max-w-sm">
              <GradientAgentIllustration />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {sandboxCommands.map((c) => (
                <button
                  key={c.prompt}
                  type="button"
                  disabled={streaming}
                  onClick={() => runCommand(c.prompt)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-left text-xs transition-colors disabled:opacity-50",
                    isDark ? "border-white/10 hover:border-[#1a73e8]/40 hover:bg-[#1a73e8]/5" : "border-stone-300 hover:border-[#4285F4]",
                    landingText(isDark, "muted")
                  )}
                >
                  {c.prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1">
            <div className={cn("relative overflow-hidden rounded-2xl border", landingSurface(isDark, "card"))}>
              <BorderBeam size={200} duration={10} colorFrom="#ea580c" colorTo="#fdba74" />
              <div className={cn("flex items-center gap-2 border-b px-4 py-3", isDark ? "border-white/[0.06]" : "border-stone-300/60")}>
                <Bot className="h-4 w-4 text-[#1a73e8]" />
                <span className={cn("text-sm font-medium", landingText(isDark, "primary"))}>Relvion Agent</span>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sandbox
                </span>
              </div>

              <div className="h-[320px] space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <p className={cn("py-8 text-center text-sm", landingText(isDark, "subtle"))}>
                    Ask anything — try &ldquo;Summarize my urgent threads from today&rdquo;
                  </p>
                )}
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "max-w-[90%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                        msg.role === "user"
                          ? isDark ? "ml-auto bg-white/5 text-stone-300" : "ml-auto bg-stone-200/70 text-stone-700"
                          : isDark ? "mr-4 border border-[#1a73e8]/20 bg-[#1a73e8]/5 text-stone-200" : "mr-4 border border-[#A8C7FA] bg-[#E8F0FE] text-stone-800"
                      )}
                    >
                      {msg.role === "agent" && (
                        <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#1a73e8]">
                          <Sparkles className="h-3 w-3" /> Agent
                        </span>
                      )}
                      {msg.text}
                      {msg.role === "agent" && streaming && i === messages.length - 1 && (
                        <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-[#1a73e8]" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <form onSubmit={handleSubmit} className={cn("border-t p-3", isDark ? "border-white/[0.06]" : "border-stone-300/60")}>
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={streaming}
                    placeholder="Ask the agent…"
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 disabled:opacity-50",
                      isDark ? "border-white/10 bg-white/5 text-stone-100 placeholder:text-stone-500" : "border-stone-300 bg-white text-stone-900"
                    )}
                  />
                  <button
                    type="submit"
                    disabled={streaming || !input.trim()}
                    className="rounded-xl bg-[#1a73e8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1765cc] disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Security ─────────────────────────────────────────── */

export function SecuritySection({ isDark }: { isDark: boolean }) {
  return (
    <section id="security" className={cn("relative z-10 mx-auto max-w-6xl px-6 py-20", landingSectionBg("gray"))}>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#E8EAED] bg-gradient-to-br from-[#E6F4EA] via-white to-[#E8F0FE] p-4 shadow-xl">
            <BorderBeam size={200} duration={13} colorFrom="#34A853" colorTo="#4285F4" />
            <GeometricSecurityIllustration />
            <motion.div
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-[#E8EAED] bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-[#34A853]">
                <Shield className="h-4 w-4" />
                OAuth 2.0 secured
              </span>
              <span className="text-[10px] font-medium text-[#5F6368]">TLS 1.3 · No training</span>
            </motion.div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className={sectionLabel(isDark)}>Security & privacy</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
            Trust is non-negotiable when we touch your mail.
          </h2>
          <p className={cn("mt-4 text-lg", landingText(isDark, "muted"))}>
            Relvion connects via Google OAuth — the same secure flow you use for any Google app.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {securityItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl border border-[#E8EAED] bg-white p-5 shadow-sm"
                style={{ borderTopColor: item.color, borderTopWidth: 3 }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: item.bg }}
                >
                  <item.icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <h3 className={cn("mt-3 font-semibold", landingText(isDark, "primary"))}>{item.title}</h3>
                <p className={cn("mt-1.5 text-sm leading-relaxed", landingText(isDark, "muted"))}>{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn(
          "mt-10 flex flex-wrap items-center justify-center gap-6 rounded-2xl border px-6 py-4 text-center text-xs",
          landingSurface(isDark, "elevated")
        )}
      >
        <span className={cn("flex items-center gap-2", landingText(isDark, "muted"))}>
          <Shield className="h-4 w-4 text-[#1a73e8]" /> SOC 2 Type II — in progress
        </span>
        <span className={cn("flex items-center gap-2", landingText(isDark, "muted"))}>
          <Lock className="h-4 w-4 text-[#34A853]" /> TLS 1.3 everywhere
        </span>
        <span className={cn("flex items-center gap-2", landingText(isDark, "muted"))}>
          <EyeOff className="h-4 w-4 text-[#EA4335]" /> No model training on your data
        </span>
      </motion.div>
    </section>
  );
}

/* ─── Comparison table ─────────────────────────────────── */

export function ComparisonTable({ isDark }: { isDark: boolean }) {
  return (
    <section id="compare" className={cn("relative z-10 border-y py-20", landingSectionBg(isDark))}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className={sectionLabel(isDark)}>Compare</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
            Relvion vs. the status quo.
          </h2>
          <p className={cn("mx-auto mt-4 max-w-2xl text-lg", landingText(isDark, "muted"))}>
            Gmail is free but fragmented. Superhuman is fast but expensive. Relvion combines speed, AI, and calendar — free during beta.
          </p>
        </div>

        <div className={cn("mt-12 overflow-hidden rounded-2xl border", landingSurface(isDark, "card"))}>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className={cn("border-b", isDark ? "border-white/[0.08] bg-[#111111]" : "border-stone-300 bg-[#e8e2d8]")}>
                  <th className={cn("px-5 py-4 text-left font-semibold", landingText(isDark, "muted"))}>Feature</th>
                  <th className="px-5 py-4 text-center">
                    <span className="font-bold text-[#1a73e8]">Relvion</span>
                  </th>
                  <th className={cn("px-5 py-4 text-center font-semibold", landingText(isDark, "muted"))}>Gmail</th>
                  <th className={cn("px-5 py-4 text-center font-semibold", landingText(isDark, "muted"))}>Superhuman</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b transition-colors",
                      isDark ? "border-white/[0.04] hover:bg-white/[0.02]" : "border-stone-300/50 hover:bg-stone-900/5",
                      i % 2 === 0 && (isDark ? "bg-white/[0.01]" : "bg-white/30")
                    )}
                  >
                    <td className={cn("px-5 py-3.5", landingText(isDark, "primary"))}>{row.feature}</td>
                    <td className="px-5 py-3.5 text-center bg-[#1a73e8]/5">
                      <CellIcon value={row.relvion} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <CellIcon value={row.gmail} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <CellIcon value={row.superhuman} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ──────────────────────────────────────────── */

export function PricingSection({ isDark, ctaHref }: { isDark: boolean; ctaHref: string }) {
  return (
    <section id="pricing" className={cn("relative z-10 mx-auto max-w-6xl px-6 py-20", landingSectionBg(isDark))}>
      <div className="text-center">
        <p className={sectionLabel(isDark)}>Pricing</p>
        <h2 className={cn("mt-3 text-3xl font-bold tracking-tight sm:text-4xl", landingText(isDark, "primary"))}>
          Free during beta. Pro when you&apos;re ready.
        </h2>
        <p className={cn("mx-auto mt-4 max-w-2xl text-lg", landingText(isDark, "muted"))}>
          Full access today at no cost. Founding users keep preferential pricing when paid tiers launch.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-2xl border p-6",
              landingSurface(isDark, plan.highlight ? "elevated" : "card"),
              plan.highlight && "ring-1 ring-[#4285F4]/40"
            )}
          >
            {plan.highlight && <BorderBeam size={180} duration={12} colorFrom="#ea580c" colorTo="#fdba74" />}
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className={cn("text-lg font-bold", landingText(isDark, "primary"))}>{plan.name}</h3>
                <span className="rounded-full bg-[#1a73e8]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1a73e8]">
                  {plan.badge}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#1a73e8]">{plan.price}</span>
                <span className={cn("text-sm", landingText(isDark, "muted"))}>{plan.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className={cn("flex items-start gap-2 text-sm", landingText(isDark, "muted"))}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1a73e8]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.id === "beta" ? ctaHref : plan.ctaHref}
                className={cn(
                  "mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all",
                  plan.highlight ? primaryButton(isDark) : ghostButton(isDark)
                )}
              >
                {plan.cta}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature comparison mini-table */}
      <div className={cn("mt-12 overflow-hidden rounded-2xl border", landingSurface(isDark, "card"))}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className={cn("border-b", isDark ? "border-white/[0.08]" : "border-stone-300")}>
                <th className={cn("px-5 py-3 text-left", landingText(isDark, "muted"))} />
                <th className="px-5 py-3 text-center font-semibold text-[#1a73e8]">Beta</th>
                <th className={cn("px-5 py-3 text-center", landingText(isDark, "muted"))}>Pro</th>
                <th className={cn("px-5 py-3 text-center", landingText(isDark, "muted"))}>Team</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["AI Agent & triage", true, true, true],
                ["Analytics dashboard", true, true, true],
                ["Team inboxes", false, true, true],
                ["SSO / SAML", false, false, true],
                ["API access", false, true, true],
              ].map(([label, beta, pro, team]) => (
                <tr key={String(label)} className={cn("border-b", isDark ? "border-white/[0.04]" : "border-stone-300/50")}>
                  <td className={cn("px-5 py-3", landingText(isDark, "primary"))}>{label}</td>
                  <td className="px-5 py-3 text-center"><CellIcon value={beta as boolean} /></td>
                  <td className="px-5 py-3 text-center"><CellIcon value={pro as boolean} /></td>
                  <td className="px-5 py-3 text-center"><CellIcon value={team as boolean} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ghostButton(isDark: boolean) {
  return cn(
    "border",
    isDark ? "border-white/10 text-stone-200 hover:bg-white/5" : "border-stone-300 text-stone-800 hover:bg-stone-900/5"
  );
}

/* ─── Team / social proof ──────────────────────────────── */

export function TeamSocialProof({ isDark }: { isDark: boolean }) {
  return (
    <section className={cn("relative z-10 border-y py-16", landingSectionBg(isDark))}>
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className={cn("text-sm", landingText(isDark, "muted"))}>
          Built by engineers who lived in Superhuman, Gmail, and Notion — now shipping one workspace.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {["Google", "Stripe", "Linear", "Vercel", "Notion"].map((co) => (
            <span
              key={co}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold tracking-tight",
                landingSurface(isDark, "card"),
                landingText(isDark, "muted")
              )}
            >
              {co}
            </span>
          ))}
          <span className="text-xs text-[#1a73e8]">+ alumni network</span>
        </div>
      </div>
      <div className="mt-10">
        <InfiniteMovingCards items={teamLogos} direction="left" speed="slow" isDark={isDark} />
      </div>
    </section>
  );
}

/* ─── Changelog ────────────────────────────────────────── */

export function ChangelogSection({ isDark }: { isDark: boolean }) {
  return (
    <section id="changelog" className={cn("relative z-10 mx-auto max-w-6xl px-6 py-20", landingSectionBg(isDark))}>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="lg:w-1/3">
          <p className={sectionLabel(isDark)}>What&apos;s new</p>
          <h2 className={cn("mt-3 text-3xl font-bold tracking-tight", landingText(isDark, "primary"))}>
            Shipping every week.
          </h2>
          <p className={cn("mt-4 text-base leading-relaxed", landingText(isDark, "muted"))}>
            Beta means rapid iteration. Here&apos;s what landed recently — matching what you&apos;ll find in the dashboard today.
          </p>
          <div className={cn("mt-6 flex items-center gap-2 text-sm text-[#1a73e8]")}>
            <Zap className="h-4 w-4" />
            <span>6 releases in the last 30 days</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {changelogEntries.map((entry, i) => (
            <motion.div
              key={entry.title}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "group flex gap-4 rounded-xl border p-4 transition-colors hover:border-[#1a73e8]/30",
                landingSurface(isDark, "card")
              )}
            >
              <div className="shrink-0 text-right">
                <p className={cn("text-xs font-mono", landingText(isDark, "subtle"))}>{entry.date}</p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    entry.tag === "New" ? "bg-emerald-500/15 text-emerald-500" : "bg-[#1a73e8]/15 text-[#1a73e8]"
                  )}
                >
                  {entry.tag}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={cn("font-semibold", landingText(isDark, "primary"))}>{entry.title}</h3>
                <p className={cn("mt-1 text-sm", landingText(isDark, "muted"))}>{entry.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#1a73e8] opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Floating changelog widget ──────────────────────── */

export function ChangelogFloatingWidget({ isDark }: { isDark: boolean }) {
  const [open, setOpen] = useState(false);
  const latest = changelogEntries.slice(0, 3);

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={cn("mb-3 w-72 overflow-hidden rounded-2xl border shadow-2xl", landingSurface(isDark, "elevated"))}
          >
            <div className={cn("border-b px-4 py-3", isDark ? "border-white/[0.08]" : "border-stone-300")}>
              <p className={cn("text-sm font-semibold", landingText(isDark, "primary"))}>What&apos;s new</p>
            </div>
            <div className="max-h-64 space-y-0 overflow-y-auto p-2">
              {latest.map((e) => (
                <div key={e.title} className={cn("rounded-lg px-3 py-2.5", landingText(isDark, "muted"))}>
                  <p className={cn("text-xs font-medium", landingText(isDark, "primary"))}>{e.title}</p>
                  <p className="mt-0.5 text-[11px]">{e.desc}</p>
                </div>
              ))}
            </div>
            <a href="#changelog" onClick={() => setOpen(false)} className="block border-t px-4 py-2.5 text-center text-xs font-medium text-[#1a73e8] hover:bg-[#1a73e8]/5">
              View full changelog →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-lg transition-all hover:scale-105",
          landingSurface(isDark, "elevated"),
          "hover:border-[#1a73e8]/40"
        )}
      >
        <Sparkles className="h-4 w-4 text-[#1a73e8]" />
        <span className={landingText(isDark, "primary")}>What&apos;s new</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a73e8] text-[10px] font-bold text-white">
          {changelogEntries.length}
        </span>
      </button>
    </div>
  );
}
