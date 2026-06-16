"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export function TracingBeam({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="absolute top-0 left-4 h-full w-[2px] overflow-hidden rounded-full bg-white/5">
        <motion.div
          style={{ scaleY, opacity, transformOrigin: "top" }}
          className="h-full w-full bg-orange-600"
        />
        <motion.div
          style={{ scaleY, opacity, transformOrigin: "top" }}
          className="absolute top-0 left-0 h-full w-full bg-orange-400/50 blur-sm"
        />
      </div>
      {children}
    </div>
  );
}
