"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type BlurFadeProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
  blur?: string;
};

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.5,
  yOffset = 8,
  inView: inViewEnabled = true,
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, filter: `blur(${blur})` }}
      animate={
        !inViewEnabled || inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: yOffset, filter: `blur(${blur})` }
      }
      transition={{ delay, duration, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
