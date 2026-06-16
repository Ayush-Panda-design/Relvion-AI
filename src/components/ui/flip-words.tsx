"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FlipWords({
  words,
  className,
  duration = 2800,
}: {
  words: string[];
  className?: string;
  duration?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(id);
  }, [words, duration]);

  return (
    <span className={cn("relative inline-block overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 16, rotateX: 90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -16, rotateX: -90 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block text-orange-600"
          style={{ transformOrigin: "50% 50%" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
