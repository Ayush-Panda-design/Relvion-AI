"use client";

import { cn } from "@/lib/utils";

export function BorderBeam({
  className,
  size = 200,
  duration = 8,
  delay = 0,
  colorFrom = "#ea580c",
  colorTo = "#fb923c",
  borderWidth = 1,
}: {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
}) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": `${duration}s`,
          "--delay": `-${delay}s`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--border-width": `${borderWidth}px`,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:var(--border-width)_solid_transparent]",
        "[mask-clip:padding-box,border-box] [mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_12px)]",
        className
      )}
    />
  );
}
