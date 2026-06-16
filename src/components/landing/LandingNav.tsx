"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/BrandMark";
import { landingText, primaryButton } from "./theme";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#integrations", label: "Integrations" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#compare", label: "Compare" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
] as const;

type LandingNavProps = {
  isDark: boolean;
  onThemeToggle: () => void;
  session: boolean;
  ctaHref: string;
  ctaLabel: string;
};

export function LandingNav({
  isDark,
  onThemeToggle,
  session,
  ctaHref,
  ctaLabel,
}: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-all duration-300",
          scrolled
            ? isDark
              ? "border-b border-white/[0.08] bg-[#0a0a0a]/85 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              : "border-b border-stone-300/70 bg-[#f0ebe3]/90 shadow-[0_4px_24px_rgba(28,25,23,0.08)] backdrop-blur-xl"
            : isDark
              ? "border-b border-transparent bg-[#0a0a0a]/40 backdrop-blur-md"
              : "border-b border-transparent bg-[#f0ebe3]/60 backdrop-blur-md"
        )}
      >
        {/* Accent line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-orange-600/50 to-transparent transition-opacity duration-300",
            scrolled ? "opacity-100" : "opacity-40"
          )}
        />

        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 sm:px-6",
            scrolled ? "h-14" : "h-16"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-xl py-1 pr-2 transition-opacity hover:opacity-90"
          >
            <div className="rounded-xl bg-white/90 p-1 shadow-sm ring-1 ring-stone-200/80 transition-transform group-hover:scale-105 dark:bg-white/10 dark:ring-white/10">
              <BrandMark size={28} variant={isDark ? "dark" : "light"} />
            </div>
            <span className={cn("text-lg font-bold tracking-tight", landingText(isDark, "primary"))}>
              Relvion<span className="text-orange-600">.</span>
            </span>
          </Link>

          {/* Desktop nav — pill container */}
          <nav
            className={cn(
              "hidden items-center gap-0.5 rounded-full border p-1 lg:flex",
              isDark ? "border-white/[0.08] bg-white/[0.04]" : "border-stone-300/60 bg-white/50 shadow-sm"
            )}
            aria-label="Main"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  landingText(isDark, "muted"),
                  "hover:text-orange-600",
                  isDark ? "hover:bg-white/[0.06]" : "hover:bg-stone-900/[0.04]"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onThemeToggle}
              aria-label="Toggle theme"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border transition-all",
                isDark
                  ? "border-white/10 bg-white/[0.04] hover:border-orange-600/30 hover:bg-white/[0.08]"
                  : "border-stone-300/80 bg-white/80 hover:border-orange-400 hover:bg-white shadow-sm"
              )}
            >
              {isDark ? <Sun className="h-4 w-4 text-orange-500" /> : <Moon className="h-4 w-4 text-stone-600" />}
            </button>

            {!session && (
              <Link
                href="/signin"
                className={cn(
                  "hidden text-sm font-medium transition-colors hover:text-orange-600 sm:inline",
                  landingText(isDark, "muted")
                )}
              >
                Sign In
              </Link>
            )}

            <Link
              href={ctaHref}
              className={cn(primaryButton(isDark), "hidden rounded-full px-5 py-2.5 text-sm sm:inline-flex")}
            >
              {session ? "Dashboard" : "Get Started"}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border lg:hidden",
                isDark ? "border-white/10 bg-white/[0.04]" : "border-stone-300 bg-white/80"
              )}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer so content isn't hidden under fixed header */}
      <div className={cn("shrink-0 transition-all duration-300", scrolled ? "h-14" : "h-16")} aria-hidden />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className={cn(
                "fixed inset-y-0 right-0 z-[120] flex w-[min(100%,320px)] flex-col border-l shadow-2xl lg:hidden",
                isDark ? "border-white/[0.08] bg-[#0a0a0a]" : "border-stone-300 bg-[#f0ebe3]"
              )}
            >
              <div className="flex items-center justify-between border-b border-inherit px-5 py-4">
                <span className={cn("font-semibold", landingText(isDark, "primary"))}>Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className={cn("rounded-full p-2", isDark ? "hover:bg-white/5" : "hover:bg-stone-900/5")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                {NAV_LINKS.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        landingText(isDark, "muted"),
                        isDark ? "hover:bg-white/[0.06] hover:text-orange-500" : "hover:bg-stone-900/5 hover:text-orange-600"
                      )}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="space-y-2 border-t border-inherit p-4">
                {!session && (
                  <Link
                    href="/signin"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block w-full rounded-xl border py-3 text-center text-sm font-semibold",
                      isDark ? "border-white/10" : "border-stone-300",
                      landingText(isDark, "primary")
                    )}
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  href={ctaHref}
                  onClick={() => setMobileOpen(false)}
                  className={cn(primaryButton(isDark), "w-full justify-center rounded-xl")}
                >
                  {ctaLabel}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
