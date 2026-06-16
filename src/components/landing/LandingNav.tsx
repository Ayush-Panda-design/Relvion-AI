"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/BrandMark";
import { primaryButton } from "./theme";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#compare", label: "Compare" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
] as const;

type LandingNavProps = {
  session: boolean;
  ctaHref: string;
  ctaLabel: string;
};

export function LandingNav({ session, ctaHref, ctaLabel }: LandingNavProps) {
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
            ? "border-b border-[#E8EAED] bg-white/95 shadow-sm backdrop-blur-xl"
            : "border-b border-transparent bg-white/80 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 sm:px-6 h-14">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-xl py-1 pr-2">
            <div className="rounded-xl bg-[#F8F9FA] p-1 ring-1 ring-[#E8EAED] transition-transform group-hover:scale-105">
              <BrandMark size={28} variant="light" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#202124]">
              Relvion
              <span className="text-[#4285F4]">.</span>
              <span className="text-[#34A853]">.</span>
              <span className="text-[#FBBC04]">.</span>
              <span className="text-[#EA4335]">.</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-0.5 rounded-full border border-[#E8EAED] bg-[#F8F9FA] p-1 lg:flex"
            aria-label="Main"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[#5F6368] transition-colors hover:bg-white hover:text-[#1a73e8]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {!session && (
              <Link
                href="/signin"
                className="hidden text-sm font-medium text-[#5F6368] transition-colors hover:text-[#1a73e8] sm:inline"
              >
                Sign In
              </Link>
            )}

            <Link
              href={ctaHref}
              className={cn(primaryButton(), "hidden rounded-full px-5 py-2.5 text-sm sm:inline-flex")}
            >
              {session ? "Dashboard" : "Get Started"}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8EAED] bg-[#F8F9FA] text-[#202124] lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="h-14 shrink-0" aria-hidden />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-[120] flex w-[min(100%,320px)] flex-col border-l border-[#E8EAED] bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-[#E8EAED] px-5 py-4">
                <span className="font-semibold text-[#202124]">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 hover:bg-[#F8F9FA]"
                >
                  <X className="h-5 w-5 text-[#5F6368]" />
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
                      className="block rounded-xl px-4 py-3 text-base font-medium text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#1a73e8]"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="space-y-2 border-t border-[#E8EAED] p-4">
                {!session && (
                  <Link
                    href="/signin"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-xl border border-[#DADCE0] py-3 text-center text-sm font-semibold text-[#1a73e8]"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  href={ctaHref}
                  onClick={() => setMobileOpen(false)}
                  className={cn(primaryButton(), "w-full justify-center rounded-xl")}
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
