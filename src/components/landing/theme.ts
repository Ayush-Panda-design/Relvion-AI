import { cn } from "@/lib/utils";

export type LandingTheme = "dark" | "light";

export function landingSurface(isDark: boolean, variant: "page" | "card" | "elevated" = "card") {
  const map = {
    page: isDark ? "bg-[#0a0a0a]" : "bg-[#f0ebe3]",
    card: isDark ? "bg-[#111111] border-white/[0.08]" : "bg-[#e8e2d8] border-stone-300/70",
    elevated: isDark ? "bg-[#161616] border-white/[0.1]" : "bg-[#f5f0e8] border-stone-300/80",
  };
  return map[variant];
}

export function landingText(isDark: boolean, variant: "primary" | "muted" | "subtle" = "primary") {
  const map = {
    primary: isDark ? "text-stone-100" : "text-stone-900",
    muted: isDark ? "text-stone-400" : "text-stone-600",
    subtle: isDark ? "text-stone-500" : "text-stone-500",
  };
  return map[variant];
}

export function sectionLabel() {
  return "text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-600";
}

export function primaryButton(isDark: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-all",
    "hover:bg-orange-500 active:scale-[0.98]",
    isDark ? "shadow-none" : "shadow-sm"
  );
}

export function ghostButton(isDark: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-all",
    isDark
      ? "border-white/10 text-stone-200 hover:bg-white/5"
      : "border-stone-400/50 text-stone-800 hover:bg-stone-900/5"
  );
}
