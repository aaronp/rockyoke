// src/components/jukebox/ArchFrame.tsx
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function ArchFrame({ children, className }: Props) {
  return (
    <div className={cn("relative", className)}>
      {/* SVG arch background */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 280"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="archWood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="50%" stopColor="#4A3728" />
            <stop offset="100%" stopColor="#2D1F16" />
          </linearGradient>
          <linearGradient id="archGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B7355" />
            <stop offset="50%" stopColor="#C4A35A" />
            <stop offset="100%" stopColor="#8B7355" />
          </linearGradient>
        </defs>
        {/* Outer arch shape */}
        <path
          d="M 0 280 L 0 100 Q 0 0 200 0 Q 400 0 400 100 L 400 280 Z"
          fill="url(#archWood)"
        />
        {/* Gold trim at arch edge */}
        <path
          d="M 10 280 L 10 100 Q 10 10 200 10 Q 390 10 390 100 L 390 280"
          fill="none"
          stroke="url(#archGold)"
          strokeWidth="4"
        />
      </svg>
      {/* Content area (inset from frame) */}
      <div className="relative z-10 mx-6 mt-4 mb-2 h-[calc(100%-1.5rem)] overflow-hidden rounded-t-[80px] bg-gradient-to-b from-rose-950/80 via-neutral-950 to-neutral-900">
        {children}
      </div>
    </div>
  );
}
