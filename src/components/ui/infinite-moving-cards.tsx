"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
  isDark = true,
}: {
  items: { quote: string; name: string; role: string }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  isDark?: boolean;
}) {
  const duration = speed === "fast" ? 25 : speed === "normal" ? 40 : 55;
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className
      )}
    >
      <motion.div
        className={cn("flex w-max gap-5", pauseOnHover && "hover:[animation-play-state:paused]")}
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <figure
            key={`${item.name}-${i}`}
            className={cn(
              "w-[320px] shrink-0 rounded-xl border p-6 transition-shadow hover:shadow-lg hover:shadow-orange-600/5",
              isDark
                ? "border-white/10 bg-[#111111] hover:border-orange-600/30"
                : "border-stone-300/70 bg-[#e8e2d8] hover:border-orange-400"
            )}
          >
            <blockquote className={cn("text-sm leading-relaxed", isDark ? "text-stone-400" : "text-stone-600")}>
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4">
              <p className={cn("text-sm font-semibold", isDark ? "text-stone-100" : "text-stone-900")}>{item.name}</p>
              <p className={cn("text-xs", isDark ? "text-stone-500" : "text-stone-500")}>{item.role}</p>
            </figcaption>
          </figure>
        ))}
      </motion.div>
    </div>
  );
}
