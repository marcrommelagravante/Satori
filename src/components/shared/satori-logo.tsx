import React from "react";
import { cn } from "@/lib/utils";

interface SatoriLogoProps {
  size?: number;
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  showTagline?: boolean;
  taglineClassName?: string;
  variant?: "default" | "light" | "dark";
}

/**
 * Official Satori Brand Logo
 * Geometric "S" Mark + Wordmark + Tagline
 * Color specifications:
 * - Primary Navy: #0F2D4A (Light mode)
 * - White: #FFFFFF (Dark mode)
 */
export function SatoriLogo({
  size = 28,
  className,
  markClassName,
  showWordmark = false,
  wordmarkClassName,
  showTagline = false,
  taglineClassName,
  variant = "default",
}: SatoriLogoProps) {
  // Exact aspect ratio of Satori geometric mark (83w : 131h)
  const markWidth = Math.round((size * 83) / 131);

  const fillClass =
    variant === "light"
      ? "fill-[#0F2D4A]"
      : variant === "dark"
      ? "fill-white"
      : "fill-[#0F2D4A] dark:fill-white";

  return (
    <div className={cn("inline-flex items-center gap-2.5 group", className)}>
      <svg
        width={markWidth}
        height={size}
        viewBox="0 0 83 131"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "shrink-0 transition-transform duration-200 group-hover:scale-105",
          fillClass,
          markClassName
        )}
        aria-label="Satori Mark"
      >
        {/* Top slanted parallelogram bar */}
        <path d="M0 36L83 0V28L0 64V36Z" />
        {/* Bottom geometric S folded chevron */}
        <path d="M48 54L83 69V95L0 131V103L50 86L16 70L48 54Z" />
      </svg>

      {(showWordmark || showTagline) && (
        <div className="flex flex-col justify-center leading-none">
          {showWordmark && (
            <span
              className={cn(
                "font-heading font-bold text-lg tracking-tight text-[#0F2D4A] dark:text-white transition-colors",
                wordmarkClassName
              )}
            >
              Satori
            </span>
          )}
          {showTagline && (
            <span
              className={cn(
                "text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5 tracking-normal",
                taglineClassName
              )}
            >
              Your knowledge, intelligently connected.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
