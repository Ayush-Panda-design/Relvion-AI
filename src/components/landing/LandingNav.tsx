"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/BrandMark";
import { MovingBorder } from "@/components/ui/moving-border";
import { primaryButton } from "./theme";

const NAV_LINKS = [
  { href: "#product", label: "Product", id: "product" },
  { href: "#demo", label: "Demo", id: "demo" },
  { href: "#pricing", label: "Pricing", id: "pricing" },
  { href: "#compare", label: "Compare", id: "compare" },
  { href: "#security", label: "Security", id: "security" },
  { href: "#faq", label: "FAQ", id: "faq" },
] as const;

type LandingNavProps = {
  session: boolean;
  ctaHref: string;
  ctaLabel: string;
};

function NavPill({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active ? "text-[#1a73e8]" : "text-[#5F6368] hover:text-[#3C4043]"
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-[#E8EAED]"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

export function LandingNav({ session, ctaHref, ctaLabel }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  const { scrollYProgress } = useScroll();
  const progressSpring = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const observeSections = useCallback(() => {
    const ids = NAV_LINKS.map((l) => l.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cleanup = observeSections();
    return cleanup;
  }, [observeSections]);

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
            ? "border-b border-[#E8EAED] bg-[#FAFBFC]/95 shadow-sm backdrop-blur-xl"
            : "border-b border-transparent bg-[#FAFBFC]/85 backdrop-blur-md"
        )}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC04]"
          style={{ scaleX: progressSpring }}
        />

        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="group flex min-w-0 flex-1 items-center gap-2 rounded-xl py-1 sm:gap-2.5 sm:pr-2">
            <motion.div
              whileHover={{ rotate: [0, -4, 4, 0], scale: 1.05 }}
              transition={{ duration: 0.45 }}
              className="shrink-0 rounded-xl bg-white p-1 ring-1 ring-[#E8EAED]"
            >
              <BrandMark size={28} variant="light" />
            </motion.div>
            <span className="truncate text-base font-bold tracking-tight text-[#202124] sm:text-lg">
              Relvion
              <motion.span
                className="hidden gap-0.5 sm:inline-flex"
                initial="rest"
                whileHover="hover"
              >
                {(["#4285F4", "#34A853", "#FBBC04", "#EA4335"] as const).map((c, i) => (
                  <motion.span
                    key={c}
                    className="inline-block"
                    variants={{
                      rest: { y: 0 },
                      hover: { y: [0, -3, 0] },
                    }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    style={{ color: c }}
                  >
                    .
                  </motion.span>
                ))}
              </motion.span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-0.5 rounded-full border border-[#E8EAED] bg-[#F1F3F4]/80 p-1 lg:flex"
            aria-label="Main"
          >
            {NAV_LINKS.map((l) => (
              <NavPill key={l.href} href={l.href} label={l.label} active={activeId === l.id} />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {!session && (
              <Link
                href="/signin"
                className="hidden text-sm font-medium text-[#5F6368] transition-colors hover:text-[#1a73e8] lg:inline"
              >
                Sign In
              </Link>
            )}

            <MovingBorder
              as={Link}
              href={ctaHref}
              duration={2800}
              borderClassName="h-3 w-3 bg-gradient-to-r from-[#4285F4] to-[#34A853] opacity-70"
              containerClassName={cn(
                "hidden rounded-full lg:inline-flex",
                primaryButton(),
                "overflow-visible rounded-full px-5 py-2.5 text-sm"
              )}
              className="flex items-center gap-2 rounded-full bg-[#1a73e8] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {session ? "Dashboard" : "Get Started"}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </MovingBorder>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DADCE0] bg-white text-[#202124] shadow-sm lg:hidden"
            >
              <Menu className="h-5 w-5" />
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
              className="fixed inset-0 z-[110] bg-[#202124]/25 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-[120] flex w-[min(100%,320px)] flex-col border-l border-[#E8EAED] bg-[#FAFBFC] shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-[#E8EAED] px-5 py-4">
                <span className="font-semibold text-[#202124]">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 hover:bg-white"
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
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        activeId === l.id
                          ? "bg-white text-[#1a73e8] shadow-sm"
                          : "text-[#5F6368] hover:bg-white hover:text-[#1a73e8]"
                      )}
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
