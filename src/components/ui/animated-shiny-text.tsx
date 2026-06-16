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
        "bg-[linear-gradient(110deg,currentColor_35%,#ea580c_50%,currentColor_65%)]",
        className
      )}
    >
      {children}
    </span>
  );
}
