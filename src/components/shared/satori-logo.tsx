import React from "react";
import { cn } from "@/lib/utils";

interface SatoriLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function SatoriLogo({
  size = 28,
  className,
  showWordmark = false,
  wordmarkClassName,
}: SatoriLogoProps) {
  const gradientId = React.useId();

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-label="Satori"
      >
        <defs>
          <linearGradient
            id={`${gradientId}-grad`}
            x1="4"
            y1="4"
            x2="28"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-inner`}
            x1="8"
            y1="8"
            x2="24"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
        </defs>

        {/* Outer flowing enso / vortex swirl */}
        <path
          d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 11.2 27.56 6.96 23.88 4.48C23.08 3.94 22.02 4.28 21.64 5.16C21.28 6 21.66 7.02 22.42 7.56C25.32 9.56 27.2 12.82 27.2 16C27.2 22.18 22.18 27.2 16 27.2C9.82 27.2 4.8 22.18 4.8 16C4.8 9.82 9.82 4.8 16 4.8C18.66 4.8 21.1 5.72 23 7.28C23.82 7.94 25.04 7.74 25.6 6.88C26.16 6.02 25.88 4.84 25 4.22C22.48 2.78 19.34 2 16 2Z"
          fill={`url(#${gradientId}-grad)`}
        />

        {/* Dynamic inner crest wave */}
        <path
          d="M16 8.5C11.86 8.5 8.5 11.86 8.5 16C8.5 20.14 11.86 23.5 16 23.5C18.96 23.5 21.5 21.78 22.68 19.28C23.08 18.42 22.64 17.42 21.76 17.06C20.88 16.7 17.92 18.24 16 18.24C14.76 18.24 13.76 17.24 13.76 16C13.76 14.76 14.76 13.76 16 13.76C17.68 13.76 18.94 14.88 19.86 14.28C20.6 13.8 20.9 12.84 20.38 12.12C19.3 10.02 17.8 8.5 16 8.5Z"
          fill={`url(#${gradientId}-inner)`}
        />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            "font-heading font-bold text-lg tracking-tight text-foreground",
            wordmarkClassName
          )}
        >
          Satori
        </span>
      )}
    </div>
  );
}
