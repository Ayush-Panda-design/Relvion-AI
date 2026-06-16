"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TextRevealCard({
  text,
  revealText,
  children,
  className,
}: {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("group relative min-h-[140px] overflow-hidden rounded-xl border p-6", className)}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: hovered
            ? `radial-gradient(280px circle at ${mouse.x}px ${mouse.y}px, rgba(234,88,12,0.12), transparent 70%)`
            : undefined,
        }}
      />
      <div className="relative z-10">
        {children}
        <p className="mt-3 text-sm leading-relaxed opacity-80 transition-opacity group-hover:opacity-0">{text}</p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-x-6 bottom-6 text-sm leading-relaxed text-orange-600"
        >
          {revealText}
        </motion.p>
      </div>
    </div>
  );
}
