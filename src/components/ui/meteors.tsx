"use client";

import { useMemo } from "react";
import { cn, seededUnit } from "@/lib/utils";

export function Meteors({ number = 12, className }: { number?: number; className?: string }) {
  const items = useMemo(
    () =>
      Array.from({ length: number }, (_, i) => ({
        id: i,
        left: `${seededUnit(i + 5001) * 100}%`,
        delay: seededUnit(i + 6001) * 2,
        duration: 3 + seededUnit(i + 7001) * 4,
      })),
    [number]
  );

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {items.map((m) => (
        <span
          key={m.id}
          className="animate-meteor absolute h-0.5 w-0.5 rotate-[215deg] rounded-full bg-orange-500 shadow-[0_0_0_1px_#ea580c40]"
          style={{
            top: "-5%",
            left: m.left,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
          }}
        >
          <span className="absolute top-1/2 -z-10 h-px w-[60px] -translate-y-1/2 bg-gradient-to-r from-orange-500 to-transparent" />
        </span>
      ))}
    </div>
  );
}
