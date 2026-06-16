import { cn } from "@/lib/utils";

/** Google-inspired landing palette */
export const GOOGLE = {
  blue: "#4285F4",
  green: "#34A853",
  yellow: "#FBBC04",
  red: "#EA4335",
  blueLight: "#E8F0FE",
  greenLight: "#E6F4EA",
  yellowLight: "#FEF7E0",
  gray: "#F8F9FA",
  text: "#202124",
  textMuted: "#5F6368",
} as const;

export type LandingSectionVariant = "white" | "gray" | "blue" | "green" | "cream";

/** @deprecated Landing is light-only; kept for child component props */
export type LandingTone = "dark" | "light";
export type LandingThemeInput = LandingTone | boolean;

const SECTION_BG: Record<LandingSectionVariant, string> = {
  white: "bg-[#FAFBFC] text-[#202124]",
  gray: "bg-[#F6F7F8] text-[#202124]",
  blue: "bg-[#F0F4FA] text-[#202124]",
  green: "bg-[#F2F7F4] text-[#202124]",
  cream: "bg-[#FBF8F2] text-[#202124]",
};

export function resolveTone(_input: LandingThemeInput): LandingTone {
  return "light";
}

export function isDarkTone(_input: LandingThemeInput) {
  return false;
}

export function landingSectionBg(input: LandingSectionVariant | LandingThemeInput = "white") {
  if (input === "white" || input === "gray" || input === "blue" || input === "green" || input === "cream") {
    return SECTION_BG[input];
  }
  return SECTION_BG.white;
}

export function landingSurface(_input: LandingThemeInput, variant: "page" | "card" | "elevated" = "card") {
  const map = {
    page: "bg-white",
    card: "bg-white border-[#DADCE0] shadow-sm",
    elevated: "bg-white border-[#DADCE0] shadow-md",
  };
  return map[variant];
}

export function landingText(_input: LandingThemeInput, variant: "primary" | "muted" | "subtle" = "primary") {
  const map = {
    primary: "text-[#202124]",
    muted: "text-[#5F6368]",
    subtle: "text-[#80868B]",
  };
  return map[variant];
}

export function sectionLabel(_input: LandingThemeInput = "light") {
  return cn("text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a73e8]");
}

export function primaryButton(_input: LandingThemeInput = "light") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white transition-all",
    "hover:bg-[#1765cc] hover:shadow-md active:scale-[0.98] shadow-sm"
  );
}

export function secondaryButton(_input: LandingThemeInput = "light") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border border-[#DADCE0] bg-white px-6 py-3 text-sm font-semibold text-[#1a73e8] transition-all",
    "hover:bg-[#F8F9FA] hover:border-[#1a73e8]/40 active:scale-[0.98]"
  );
}

export function ghostButton(input: LandingThemeInput = "light") {
  return secondaryButton(input);
}

/** Multi-color accent for headlines (Google logo style) */
export function googleHeadlineAccent(word: "blue" | "green" | "yellow" | "red") {
  const colors = {
    blue: "text-[#4285F4]",
    green: "text-[#34A853]",
    yellow: "text-[#E37400]",
    red: "text-[#EA4335]",
  };
  return colors[word];
}

export type LandingTheme = LandingTone;
