// src/hooks/useTickets.ts
import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "rockyoke-tickets";

type TicketData = {
  id: string;
  purchasedAt: string;
};

type TicketStorage = {
  tickets: TicketData[];
  pendingConfirmation: boolean;
};

function getStoredTickets(): TicketStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // localStorage unavailable or corrupted
  }
  return { tickets: [], pendingConfirmation: false };
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

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredTickets();
    setTickets(stored.tickets);
    setPendingConfirmation(stored.pendingConfirmation);
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
      saveTickets({ tickets: updated, pendingConfirmation: true });
      return updated;
    });
    setPendingConfirmation(true);
  }, []);

  // Clear pending confirmation flag (after showing modal)
  const clearPendingConfirmation = useCallback(() => {
    setPendingConfirmation(false);
    // Read current tickets from localStorage to avoid stale closure
    const current = getStoredTickets();
    saveTickets({ tickets: current.tickets, pendingConfirmation: false });
  }, []);

  // Get ticket IDs for display (memoized to avoid unnecessary re-renders)
  const ticketIds = useMemo(() => tickets.map((t) => t.id), [tickets]);

  return {
    tickets,
    ticketIds,
    ticketCount: tickets.length,
    pendingConfirmation,
    addTicket,
    clearPendingConfirmation,
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
