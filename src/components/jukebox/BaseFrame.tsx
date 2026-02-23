// src/components/jukebox/BaseFrame.tsx
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function BaseFrame({ children, className }: Props) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-neutral-600 bg-gradient-to-b from-neutral-800 to-neutral-900 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {/* Chrome accent line at top */}
      <div className="absolute inset-x-4 top-0 h-0.5 bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
      {children}
    </div>
  );
}
