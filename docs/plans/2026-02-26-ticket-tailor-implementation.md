# Ticket Tailor Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder ticket purchasing flow with real Ticket Tailor embedded widget integration.

**Architecture:** Ticket Tailor widget opens as overlay, redirects to `/order-complete` with order data in query params. That route saves to localStorage and redirects to `/` where the confirmation modal appears. A custom `useTickets` hook manages all ticket state via localStorage.

**Tech Stack:** React, React Router (already installed), Ticket Tailor embed widget, localStorage

---

### Task 1: Create useTickets Hook

**Files:**
- Create: `src/hooks/useTickets.ts`

**Step 1: Create the hook file**

```typescript
// src/hooks/useTickets.ts
import { useState, useEffect, useCallback } from "react";

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
    saveTickets({ tickets, pendingConfirmation: false });
  }, [tickets]);

  // Get ticket IDs for display
  const ticketIds = tickets.map((t) => t.id);

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
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run build`
Expected: Build succeeds (hook not used yet, just compiled)

**Step 3: Commit**

```bash
git add src/hooks/useTickets.ts
git commit -m "feat: add useTickets hook for localStorage persistence"
```

---

### Task 2: Create OrderComplete Page

**Files:**
- Create: `src/pages/OrderComplete.tsx`

**Step 1: Create the OrderComplete component**

```tsx
// src/pages/OrderComplete.tsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { addTicketToStorage } from "@/hooks/useTickets";

export default function OrderComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("oid");

    if (orderId) {
      addTicketToStorage(orderId);
    }

    // Redirect to home
    navigate("/", { replace: true });
  }, [searchParams, navigate]);

  // Brief loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-amber-100">
      <p>Processing your order...</p>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/pages/OrderComplete.tsx
git commit -m "feat: add OrderComplete page for callback handling"
```

---

### Task 3: Add Route for OrderComplete

**Files:**
- Modify: `src/main.tsx`

**Step 1: Add the route**

Update `src/main.tsx` to add the `/order-complete` route:

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Jukebox from './pages/Jukebox.tsx'
import OrderComplete from './pages/OrderComplete.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Jukebox />} />
        <Route path="/order-complete" element={<OrderComplete />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
```

**Step 2: Verify build**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat: add /order-complete route"
```

---

### Task 4: Update TicketModal for Ticket Tailor Widget

**Files:**
- Modify: `src/components/TicketModal.tsx`

**Step 1: Replace TicketModal with widget trigger**

Replace the entire `src/components/TicketModal.tsx` file:

```tsx
// src/components/TicketModal.tsx
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type TicketModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  venue: string;
  date: string;
  priceAdvance: string;
  priceDoor: string;
  ticketsOwned: number;
  ticketsRemaining: number;
};

// Load Ticket Tailor widget script
function loadTicketTailorScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src*="tickettailor.com"]')) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.tickettailor.com/js/widgets/min/widget.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function TicketModal({
  open,
  onOpenChange,
  eventName,
  venue,
  date,
  priceAdvance,
  ticketsOwned,
  ticketsRemaining,
}: TicketModalProps) {
  const nameParts = eventName.split(" ");
  const firstWord = nameParts[0];
  const remainingWords = nameParts.slice(1).join(" ");

  // Load Ticket Tailor script when modal opens
  useEffect(() => {
    if (open) {
      loadTicketTailorScript();
    }
  }, [open]);

  const handleBuyTickets = async () => {
    await loadTicketTailorScript();

    // Close our modal first
    onOpenChange(false);

    // Trigger Ticket Tailor widget
    // @ts-expect-error - Ticket Tailor adds this to window
    if (window.TT && window.TT.widget) {
      // @ts-expect-error - Ticket Tailor widget API
      window.TT.widget.open({
        eventId: "ev_7722196",
        callback: "https://rockyoke.eyam.fun/order-complete",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-amber-900/50 p-0 sm:max-w-md"
        style={{
          background: `
            linear-gradient(135deg, rgba(60, 20, 10, 0.98) 0%, rgba(40, 15, 8, 0.99) 50%, rgba(30, 10, 5, 0.98) 100%)
          `,
          boxShadow: "inset 0 0 60px rgba(0, 0, 0, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Hidden but accessible title for screen readers */}
        <DialogTitle className="sr-only">Buy Tickets</DialogTitle>
        <DialogDescription className="sr-only">
          Purchase tickets for {eventName}
        </DialogDescription>

        <div className="flex flex-col items-center p-6">
          {/* Decorative top border */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-amber-500">★</span>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
            <span className="text-amber-500">★</span>
          </div>

          {/* Event name */}
          <h2
            className="mb-1 text-center font-bold uppercase tracking-widest text-amber-100"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {firstWord}
          </h2>
          {remainingWords && (
            <h3
              className="mb-4 text-center font-bold uppercase tracking-wider text-amber-200"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
              }}
            >
              {remainingWords}
            </h3>
          )}

          {/* Divider */}
          <div className="mb-4 h-px w-3/4 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

          {/* Venue & Date */}
          <p className="mb-1 text-center font-semibold uppercase tracking-wide text-amber-100">
            {venue}
          </p>
          <p className="mb-4 text-center font-bold uppercase tracking-widest text-amber-300">
            {date}
          </p>

          {/* Divider */}
          <div className="mb-4 h-px w-1/2 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

          {/* Ticket status */}
          {ticketsOwned > 0 && (
            <div className="mb-4 rounded-lg bg-green-900/50 px-4 py-2 text-center">
              <p className="text-sm font-semibold text-green-300">
                You have {ticketsOwned} ticket{ticketsOwned !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-green-400">
                {ticketsRemaining} sign-up{ticketsRemaining !== 1 ? "s" : ""} remaining
              </p>
            </div>
          )}

          {/* Price info */}
          <p className="mb-4 text-sm uppercase tracking-wide text-amber-400">
            {priceAdvance} advance
          </p>

          {/* Buy button - triggers Ticket Tailor widget */}
          <button
            onClick={handleBuyTickets}
            className="w-full rounded-lg bg-amber-500 px-6 py-3 font-bold uppercase tracking-wide text-amber-950 transition-colors hover:bg-amber-400"
          >
            Buy Tickets
          </button>

          {/* Decorative bottom border */}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
            <span className="text-xs text-amber-600">★</span>
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/TicketModal.tsx
git commit -m "feat: integrate Ticket Tailor widget in TicketModal"
```

---

### Task 5: Update Jukebox to Use useTickets Hook

**Files:**
- Modify: `src/pages/Jukebox.tsx`

**Step 1: Replace local ticket state with useTickets hook**

Make these changes to `src/pages/Jukebox.tsx`:

1. Add import for useTickets:
```tsx
import { useTickets } from "@/hooks/useTickets";
```

2. Replace these state declarations:
```tsx
// REMOVE these lines:
const [ticketsOwned, setTicketsOwned] = useState(0);
const [confirmationTicketIds, setConfirmationTicketIds] = useState<string[]>([]);
const [allTicketIds, setAllTicketIds] = useState<string[]>([]);
const [isViewingTickets, setIsViewingTickets] = useState(false);
```

With:
```tsx
// ADD these lines (after useJukeboxState):
const { ticketIds, ticketCount, pendingConfirmation, clearPendingConfirmation } = useTickets();
const [isViewingTickets, setIsViewingTickets] = useState(false);
```

3. Update ticketsRemaining calculation:
```tsx
// CHANGE from:
const ticketsRemaining = ticketsOwned - state.queue.length;
// TO:
const ticketsRemaining = ticketCount - state.queue.length;
```

4. Remove handleBuyTickets callback entirely:
```tsx
// REMOVE this:
const handleBuyTickets = useCallback((quantity: number) => {
  setTicketsOwned(prev => prev + quantity);
}, []);
```

5. Remove handlePurchaseComplete callback entirely:
```tsx
// REMOVE this:
const handlePurchaseComplete = useCallback((quantity: number) => {
  const baseNum = Math.floor(Math.random() * 9000) + 1000;
  const ticketIds = Array.from({ length: quantity }, (_, i) =>
    `#RC-2025-${String(baseNum + i).padStart(4, "0")}`
  );
  setAllTicketIds(prev => [...prev, ...ticketIds]);
  setConfirmationTicketIds(ticketIds);
  setIsViewingTickets(false);
  setConfirmationModalOpen(true);
}, []);
```

6. Update handleTicketButtonClick:
```tsx
// CHANGE from:
const handleTicketButtonClick = useCallback(() => {
  if (ticketsOwned > 0) {
    setIsViewingTickets(true);
    setConfirmationModalOpen(true);
  } else {
    setTicketModalOpen(true);
  }
}, [ticketsOwned]);

// TO:
const handleTicketButtonClick = useCallback(() => {
  if (ticketCount > 0) {
    setIsViewingTickets(true);
    setConfirmationModalOpen(true);
  } else {
    setTicketModalOpen(true);
  }
}, [ticketCount]);
```

7. Add effect to show confirmation modal for new purchases:
```tsx
// ADD this effect after the isMobile effect:
useEffect(() => {
  if (pendingConfirmation && ticketIds.length > 0) {
    setIsViewingTickets(false);
    setConfirmationModalOpen(true);
    clearPendingConfirmation();
  }
}, [pendingConfirmation, ticketIds.length, clearPendingConfirmation]);
```

8. Update TicketModal props:
```tsx
// CHANGE from:
<TicketModal
  open={ticketModalOpen}
  onOpenChange={setTicketModalOpen}
  {...EVENT_DETAILS}
  ticketsOwned={ticketsOwned}
  ticketsRemaining={ticketsRemaining}
  onBuyTickets={handleBuyTickets}
  onPurchaseComplete={handlePurchaseComplete}
/>

// TO:
<TicketModal
  open={ticketModalOpen}
  onOpenChange={setTicketModalOpen}
  {...EVENT_DETAILS}
  ticketsOwned={ticketCount}
  ticketsRemaining={ticketsRemaining}
/>
```

9. Update TicketConfirmationModal props:
```tsx
// CHANGE from:
<TicketConfirmationModal
  open={confirmationModalOpen}
  onOpenChange={setConfirmationModalOpen}
  ticketIds={isViewingTickets ? allTicketIds : confirmationTicketIds}
  showConfetti={!isViewingTickets}
  ticketsRemaining={ticketsRemaining}
  onBuyMore={handleBuyMoreTickets}
/>

// TO:
<TicketConfirmationModal
  open={confirmationModalOpen}
  onOpenChange={setConfirmationModalOpen}
  ticketIds={ticketIds}
  showConfetti={!isViewingTickets}
  ticketsRemaining={ticketsRemaining}
  onBuyMore={handleBuyMoreTickets}
/>
```

10. Update all other references from `ticketsOwned` to `ticketCount`:
- LineupPanel components: `ticketsOwned={ticketCount}`
- EventPoster component: `ticketsOwned={ticketCount}`

**Step 2: Verify build**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/pages/Jukebox.tsx
git commit -m "feat: use useTickets hook for localStorage persistence"
```

---

### Task 6: Clean Up Unused Props from TicketModal Types

**Files:**
- Verify: `src/components/TicketModal.tsx` - already updated in Task 4

The TicketModal was already updated in Task 4 to remove `onBuyTickets` and `onPurchaseComplete` from props. No additional changes needed.

**Step 1: Verify build passes**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run build`
Expected: Build succeeds with no TypeScript errors

---

### Task 7: Manual Testing

**Step 1: Start dev server**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run dev`

**Step 2: Test the flow**

1. Open http://localhost:5173
2. Click "Buy Tickets" on the poster or jukebox
3. Verify Ticket Tailor widget opens
4. Complete a test purchase (or cancel)
5. If completed, verify redirect to `/order-complete` then back to `/`
6. Verify confetti modal appears with order ID
7. Close modal, click "View Tickets" to verify tickets persisted
8. Refresh page, verify tickets still there (localStorage)

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during testing"
```

---

### Task 8: Final Build Verification

**Step 1: Production build**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run build`
Expected: Build succeeds

**Step 2: Preview production build**

Run: `cd /Users/aaron/dev/sandbox/rockyoke/.worktrees/ticket-tailor && bun run preview`
Expected: App works at http://localhost:4173

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create useTickets hook | `src/hooks/useTickets.ts` |
| 2 | Create OrderComplete page | `src/pages/OrderComplete.tsx` |
| 3 | Add /order-complete route | `src/main.tsx` |
| 4 | Integrate Ticket Tailor widget | `src/components/TicketModal.tsx` |
| 5 | Update Jukebox to use hook | `src/pages/Jukebox.tsx` |
| 6 | Verify cleanup | (verification only) |
| 7 | Manual testing | (testing only) |
| 8 | Final build verification | (verification only) |
