import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: number;
  className?: string;
  variant?: "auto" | "light" | "dark";
};

export function BrandMark({ size = 32, className, variant = "auto" }: BrandMarkProps) {
  if (variant === "light") {
    return (
      <Image
        src="/brand/icon-light.svg"
        alt="Relvion"
        width={size}
        height={size}
        className={cn("shrink-0", className)}
        priority
      />
    );
  }

  if (variant === "dark") {
    return (
      <Image
        src="/brand/icon-dark.svg"
        alt="Relvion"
        width={size}
        height={size}
        className={cn("shrink-0", className)}
        priority
      />
    );
  }

  return (
    <>
      <Image
        src="/brand/icon-light.svg"
        alt="Relvion"
        width={size}
        height={size}
        className={cn("shrink-0 dark:hidden", className)}
        priority
      />
      <Image
        src="/brand/icon-dark.svg"
        alt="Relvion"
        width={size}
        height={size}
        className={cn("hidden shrink-0 dark:block", className)}
        priority
      />
    </>
  );
}
