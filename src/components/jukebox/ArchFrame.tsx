// src/components/jukebox/ArchFrame.tsx
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

// SVG border strip matching the jukebox image
function BorderStrip({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg
      viewBox="0 0 60 280"
      preserveAspectRatio="none"
      className="h-full w-full"
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        {/* Cream outer band */}
        <linearGradient id="cream" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8D4B8" />
          <stop offset="50%" stopColor="#F5E6D3" />
          <stop offset="100%" stopColor="#E8D4B8" />
        </linearGradient>
        {/* Gold/yellow band */}
        <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset="30%" stopColor="#E8C252" />
          <stop offset="50%" stopColor="#F5D76E" />
          <stop offset="70%" stopColor="#E8C252" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
        {/* Pink/salmon stripe */}
        <linearGradient id="salmon" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C4956A" />
          <stop offset="50%" stopColor="#D4A57A" />
          <stop offset="100%" stopColor="#C4956A" />
        </linearGradient>
        {/* Inner cream glow */}
        <linearGradient id="innerCream" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4B896" />
          <stop offset="30%" stopColor="#F0DCC4" />
          <stop offset="50%" stopColor="#FFF8E7" />
          <stop offset="70%" stopColor="#F0DCC4" />
          <stop offset="100%" stopColor="#D4B896" />
        </linearGradient>
        {/* Brown edge */}
        <linearGradient id="brownEdge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3D2817" />
          <stop offset="50%" stopColor="#5C3D2E" />
          <stop offset="100%" stopColor="#3D2817" />
        </linearGradient>
      </defs>

      {/* Cream outer - leftmost */}
      <rect x="0" y="0" width="12" height="280" fill="url(#cream)" />
      {/* Gold band */}
      <rect x="12" y="0" width="10" height="280" fill="url(#gold)" />
      {/* Salmon/pink stripe */}
      <rect x="22" y="0" width="6" height="280" fill="url(#salmon)" />
      {/* Inner cream glow - widest */}
      <rect x="28" y="0" width="24" height="280" fill="url(#innerCream)" />
      {/* Brown edge - rightmost */}
      <rect x="52" y="0" width="8" height="280" fill="url(#brownEdge)" />
    </svg>
  );
}

export function ArchFrame({ children, className }: Props) {
  return (
    <div className={cn("relative overflow-hidden rounded-t-[100px]", className)}>
      {/* Dark background */}
      <div className="absolute inset-0 bg-neutral-900" />

      {/* Left border */}
      <div className="absolute left-0 top-0 bottom-0 w-[60px]">
        <BorderStrip />
      </div>

      {/* Right border (mirrored) */}
      <div className="absolute right-0 top-0 bottom-0 w-[60px]">
        <BorderStrip mirrored />
      </div>

      {/* Content area */}
      <div className="relative z-10 mx-[60px] h-full overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900">
        {children}
      </div>
    </div>
  );
}
