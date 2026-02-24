// src/components/LineupPanel.tsx
import type { QueueEntry } from "@/types/jukebox";

type LineupPanelProps = {
  queue: QueueEntry[];
  variant: "panel" | "section";
  className?: string;
  onBuyTickets?: () => void;
};

export function LineupPanel({
  queue,
  variant,
  className = "",
  onBuyTickets,
}: LineupPanelProps) {
  const isPanel = variant === "panel";
  const title = isPanel ? "The Lineup!" : "Up Next";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-neutral-900/80 ${isPanel ? "h-full" : ""
        } ${className}`}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-amber-900/30 bg-neutral-900/90 px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-500">★</span>
          <h2 className="text-center text-sm font-bold uppercase tracking-wider text-amber-400">
            {title}
          </h2>
          <span className="text-amber-500">★</span>
        </div>
        {queue.length > 0 && (
          <p className="mt-1 text-center text-xs text-amber-600">
            {queue.length} {queue.length === 1 ? "singer" : "singers"} queued
          </p>
        )}
      </div>

      {/* Queue list */}
      <div className={`flex-1 overflow-y-auto p-3 ${isPanel ? "" : "max-h-64"}`}>
        {queue.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <p className="mb-2 text-amber-200">Song sign-up required in advance</p>
            <p className="text-sm text-amber-500">Be the first to sign up!</p>
            <span className="mt-2 text-2xl">👈</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {queue.map((entry, index) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded bg-neutral-800/50 px-3 py-2"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-900/50 font-mono text-xs font-bold text-amber-400">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-amber-100">
                    {entry.name}
                  </p>
                  <p className="truncate text-xs text-amber-400">
                    {entry.song?.title ?? "Unknown Song"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Buy Tickets Button */}
      {onBuyTickets && isPanel && (
        <div className="flex-shrink-0 border-t border-amber-900/30 p-3">
          <button
            onClick={onBuyTickets}
            className="w-full rounded-lg bg-amber-500 px-4 py-2 font-bold uppercase tracking-wide text-amber-950 transition-colors hover:bg-amber-400"
          >
            Buy Tickets
          </button>
        </div>
      )}
    </div>
  );
}
