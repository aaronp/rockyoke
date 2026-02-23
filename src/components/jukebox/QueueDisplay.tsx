// src/components/jukebox/QueueDisplay.tsx
import { motion, AnimatePresence } from "framer-motion";
import type { QueueEntry } from "@/types/jukebox";

type Props = {
  queue: QueueEntry[];
};

export function QueueDisplay({ queue }: Props) {
  if (queue.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-500">
        No one in queue yet
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
        Up Next ({queue.length})
      </p>
      <ul className="space-y-1">
        <AnimatePresence>
          {queue.map((entry, index) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 rounded bg-neutral-800/50 px-2 py-1"
            >
              <span className="font-mono text-xs text-amber-500">
                {index + 1}.
              </span>
              <span className="flex-1 truncate text-sm text-neutral-200">
                {entry.name}
              </span>
              <span className="truncate text-xs text-neutral-400">
                {entry.song.title}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
