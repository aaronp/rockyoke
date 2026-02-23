// src/hooks/useQueue.ts
import { useState, useCallback } from "react";
import type { Song, QueueEntry } from "@/types/jukebox";

function generateTicketNumber(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${letter}-${number}`;
}

export function useQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);

  const addToQueue = useCallback((name: string, song: Song): QueueEntry => {
    // Placeholder: would POST to backend in future
    const entry: QueueEntry = {
      id: crypto.randomUUID(),
      name,
      song,
      ticketNumber: generateTicketNumber(),
      timestamp: Date.now(),
    };
    setQueue((prev) => [...prev, entry]);
    return entry;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return { queue, addToQueue, removeFromQueue, clearQueue };
}
