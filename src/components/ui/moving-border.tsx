"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

export function MovingBorder({
  children,
  duration = 3000,
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
  ...props
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
  [key: string]: unknown;
}) {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(progress, (val) => {
    const point = pathRef.current?.getPointAtLength(val);
    return point?.x ?? 0;
  });
  const y = useTransform(progress, (val) => {
    const point = pathRef.current?.getPointAtLength(val);
    return point?.y ?? 0;
  });

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <Component
      className={cn(
        "relative overflow-hidden bg-transparent p-[1px] text-xl",
        containerClassName
      )}
      {...props}
    >
      <div className="absolute inset-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="absolute h-full w-full"
          width="100%"
          height="100%"
        >
          <rect
            fill="none"
            width="100%"
            height="100%"
            rx="30%"
            ry="30%"
            ref={pathRef}
          />
        </svg>
        <motion.div
          style={{ position: "absolute", top: 0, left: 0, display: "inline-block", transform }}
          className={cn("h-4 w-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-80", borderClassName)}
        />
      </div>
      <div className={cn("relative z-10", className)}>{children}</div>
    </Component>
  );
}
