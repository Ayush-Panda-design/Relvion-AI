"use client";

import { cn } from "@/lib/utils";

export function AnimatedShinyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "animate-shimmer inline-flex items-center bg-[length:200%_100%] bg-clip-text text-transparent",
        "bg-[linear-gradient(110deg,#3C4043_35%,#1a73e8_50%,#3C4043_65%)]",
        className
      )}
    >
      {children}
    </span>
  );
}
