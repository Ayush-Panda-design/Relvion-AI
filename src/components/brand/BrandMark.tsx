'use client';

import { useId } from "react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: number;
  className?: string;
  variant?: "auto" | "light" | "dark";
};

function BrandMarkLight({ size, className, uid }: { size: number; className?: string; uid: string }) {
  const cardId = `relvion-light-card-${uid}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Relvion"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" fill="#fff" />
      <rect width="32" height="32" rx="9" stroke="#E8EAED" strokeWidth="1" />
      <rect x="6" y="10" width="15" height="17" rx="3.5" fill="#E6F4EA" />
      <rect x="8" y="8" width="15" height="17" rx="3.5" fill="#E8F0FE" />
      <rect x="10" y="6" width="16" height="18" rx="4" fill={`url(#${cardId})`} />
      <path
        d="M10 10.5 18 15.2 26 10.5"
        stroke="#fff"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 17.5h8M14 20h6" stroke="#fff" strokeWidth="1.15" strokeLinecap="round" opacity="0.85" />
      <circle cx="24.5" cy="8.5" r="2.25" fill="#34A853" />
      <circle cx="27" cy="12" r="1.65" fill="#FBBC04" />
      <circle cx="25.5" cy="15" r="1.5" fill="#EA4335" />
      <path
        d="M23.5 6.5 25 8 27.5 5.5"
        stroke="#4285F4"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={cardId} x1="10" y1="6" x2="26" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B9BF5" />
          <stop offset="1" stopColor="#1a73e8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BrandMarkDark({ size, className, uid }: { size: number; className?: string; uid: string }) {
  const glowId = `relvion-dark-glow-${uid}`;
  const cardId = `relvion-dark-card-${uid}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Relvion"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" fill="#171717" />
      <rect width="32" height="32" rx="9" stroke="#4285F4" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="16" cy="17" r="13" fill={`url(#${glowId})`} />
      <rect x="6" y="10" width="15" height="17" rx="3.5" fill="#34A853" fillOpacity="0.22" />
      <rect x="8" y="8" width="15" height="17" rx="3.5" fill="#4285F4" fillOpacity="0.18" />
      <rect x="10" y="6" width="16" height="18" rx="4" fill={`url(#${cardId})`} />
      <path
        d="M10 10.5 18 15.2 26 10.5"
        stroke="#fff"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 17.5h8M14 20h6" stroke="#fff" strokeWidth="1.15" strokeLinecap="round" opacity="0.9" />
      <circle cx="24.5" cy="8.5" r="2.25" fill="#34A853" />
      <circle cx="27" cy="12" r="1.65" fill="#FBBC04" />
      <circle cx="25.5" cy="15" r="1.5" fill="#EA4335" />
      <path
        d="M23.5 6.5 25 8 27.5 5.5"
        stroke="#8AB4F8"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <radialGradient
          id={glowId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(16 17) scale(13)"
        >
          <stop stopColor="#4285F4" stopOpacity="0.28" />
          <stop offset="1" stopColor="#4285F4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={cardId} x1="10" y1="6" x2="26" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8AB4F8" />
          <stop offset="1" stopColor="#4285F4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandMark({ size = 32, className, variant = "auto" }: BrandMarkProps) {
  const uid = useId().replace(/:/g, "");

  if (variant === "light") {
    return <BrandMarkLight size={size} className={className} uid={uid} />;
  }

  if (variant === "dark") {
    return <BrandMarkDark size={size} className={className} uid={uid} />;
  }

  return (
    <>
      <BrandMarkLight size={size} className={cn("dark:hidden", className)} uid={`${uid}-l`} />
      <BrandMarkDark size={size} className={cn("hidden dark:block", className)} uid={`${uid}-d`} />
    </>
  );
}
