// src/components/jukebox/PanelFrame.tsx
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function PanelFrame({ children, className }: Props) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-4 border-amber-600/80 bg-amber-500 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.3)]",
        className
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-amber-600/50 p-1">
        {children}
      </div>
    </div>
  );
}
