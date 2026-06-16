"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn, seededUnit } from "@/lib/utils";

export function AnimatedGridPattern({
  className,
  numSquares = 40,
  maxOpacity = 0.15,
}: {
  className?: string;
  numSquares?: number;
  maxOpacity?: number;
}) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);

  const squares = useMemo(
    () =>
      Array.from({ length: numSquares }, (_, i) => ({
        id: i,
        x: seededUnit(i + 1) * 100,
        y: seededUnit(i + 1001) * 100,
        delay: seededUnit(i + 2001) * 4,
        duration: 2 + seededUnit(i + 3001) * 3,
      })),
    [numSquares]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <svg
      ref={containerRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern id={`grid-${id}`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M 32 0 L 0 0 0 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-stone-500/20"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#grid-${id})`} />
      {mounted &&
        squares.map((sq) => (
          <motion.rect
            key={sq.id}
            x={`${sq.x}%`}
            y={`${sq.y}%`}
            width="32"
            height="32"
            className="fill-orange-600/20 stroke-orange-600/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, maxOpacity, 0] }}
            transition={{
              duration: sq.duration,
              repeat: Infinity,
              delay: sq.delay,
              ease: "easeInOut",
            }}
          />
        ))}
    </svg>
  );
}
