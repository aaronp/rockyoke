// src/hooks/useTickets.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import type { SelectedSong } from "@/types/jukebox";

const STORAGE_KEY = "rockyoke-tickets";

type TicketData = {
  id: string;
  purchasedAt: string;
};

type TicketStorage = {
  tickets: TicketData[];
  pendingConfirmation: boolean;
  clientRequestId: string;
  selectedSongs: SelectedSong[];
};

function generateClientRequestId(): string {
  return crypto.randomUUID();
}

function getStoredTickets(): TicketStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
        pendingConfirmation: typeof parsed.pendingConfirmation === "boolean" ? parsed.pendingConfirmation : false,
        clientRequestId: typeof parsed.clientRequestId === "string" && parsed.clientRequestId.length > 0
          ? parsed.clientRequestId
          : generateClientRequestId(),
        selectedSongs: Array.isArray(parsed.selectedSongs) ? parsed.selectedSongs : [],
      };
    }
  } catch {
    // localStorage unavailable or corrupted
  }
  return {
    tickets: [],
    pendingConfirmation: false,
    clientRequestId: generateClientRequestId(),
    selectedSongs: [],
  };
}

function saveTickets(data: TicketStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
}

export function useTickets() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<SelectedSong[]>([]);
  const [clientRequestId, setClientRequestId] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredTickets();
    setTickets(stored.tickets);
    setPendingConfirmation(stored.pendingConfirmation);
    setSelectedSongs(stored.selectedSongs);
    setClientRequestId(stored.clientRequestId);
    // Persist back if clientRequestId was just generated (i.e. was absent in storage)
    saveTickets(stored);
  }, []);

  // Add new ticket (called from OrderComplete page)
  const addTicket = useCallback((orderId: string) => {
    setTickets((prev) => {
      // Skip duplicates
      if (prev.some((t) => t.id === orderId)) {
        return prev;
      }
      const newTicket: TicketData = {
        id: orderId,
        purchasedAt: new Date().toISOString(),
      };
      const updated = [...prev, newTicket];
      // Merge with current full state from localStorage to preserve new fields
      const current = getStoredTickets();
      saveTickets({ ...current, tickets: updated, pendingConfirmation: true });
      return updated;
    });
    setPendingConfirmation(true);
  }, []);

  // Clear pending confirmation flag (after showing modal)
  const clearPendingConfirmation = useCallback(() => {
    setPendingConfirmation(false);
    // Read current state from localStorage to avoid stale closure
    const current = getStoredTickets();
    saveTickets({ ...current, pendingConfirmation: false });
  }, []);

  // Toggle a song: if same number exists, remove it; else add it.
  // For custom songs (L01), always replace (remove old, add new).
  const toggleSong = useCallback((song: SelectedSong) => {
    setSelectedSongs((prev) => {
      let updated: SelectedSong[];
      if (song.kind === "custom") {
        const existing = prev.find((s) => s.kind === "custom");
        if (existing && existing.title === song.title && existing.artist === song.artist) {
          // Same custom song — toggle off (remove)
          updated = prev.filter((s) => s.kind !== "custom");
        } else {
          // Different or new custom song — replace
          const withoutCustom = prev.filter((s) => s.kind !== "custom");
          updated = [...withoutCustom, song];
        }
      } else {
        const exists = prev.some((s) => s.number === song.number);
        if (exists) {
          updated = prev.filter((s) => s.number !== song.number);
        } else {
          updated = [...prev, song];
        }
      }
      const current = getStoredTickets();
      saveTickets({ ...current, selectedSongs: updated });
      return updated;
    });
  }, []);

  // Remove a song by its number
  const removeSong = useCallback((number: string) => {
    setSelectedSongs((prev) => {
      const updated = prev.filter((s) => s.number !== number);
      const current = getStoredTickets();
      saveTickets({ ...current, selectedSongs: updated });
      return updated;
    });
  }, []);

  // Get ticket IDs for display (memoized to avoid unnecessary re-renders)
  const ticketIds = useMemo(() => tickets.map((t) => t.id), [tickets]);

  return {
    tickets,
    ticketIds,
    ticketCount: tickets.length,
    pendingConfirmation,
    selectedSongs,
    clientRequestId,
    addTicket,
    clearPendingConfirmation,
    toggleSong,
    removeSong,
  };
}

// Static function for OrderComplete page (before hook is mounted)
export function addTicketToStorage(orderId: string): void {
  const stored = getStoredTickets();
  if (stored.tickets.some((t) => t.id === orderId)) {
    return; // Skip duplicate
  }
  stored.tickets.push({
    id: orderId,
    purchasedAt: new Date().toISOString(),
  });
  stored.pendingConfirmation = true;
  saveTickets(stored);
}
