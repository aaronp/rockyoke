# Ticket Tailor Integration Design

## Overview

Replace the placeholder "TODO: Payment Integration" with real ticket purchasing via Ticket Tailor's embedded widget.

## Configuration

- **Event ID:** `ev_7722196`
- **Callback URL:** `https://rockyoke.eyam.fun/order-complete`
- **Storage:** localStorage (persists across sessions)

## Purchase Flow

1. User clicks "Buy Tickets" button
2. Ticket Tailor embedded widget opens as overlay
3. User completes purchase within widget
4. Ticket Tailor redirects to `/order-complete?oid=...`
5. `/order-complete` route extracts ticket data, saves to localStorage, redirects to `/`
6. Jukebox detects new tickets on load, shows confetti confirmation modal

## Returning Users

- On page load, jukebox reads ticket count from localStorage
- "Buy Tickets" button becomes "View Tickets" when tickets exist (existing behavior)
- Ticket data persists across browser sessions

## File Changes

### New Files

**`src/pages/OrderComplete.tsx`**
- Extracts order data from URL query params
- Saves to localStorage
- Redirects to `/` with pending confirmation flag

**`src/hooks/useTickets.ts`**
- Custom hook to manage ticket state
- Read/write tickets from localStorage
- Track "new purchase" flag to trigger confetti modal
- Replaces local `ticketsOwned` / `allTicketIds` state in Jukebox.tsx

### Modified Files

**`src/main.tsx`**
- Add React Router with routes:
  - `/` → Jukebox
  - `/order-complete` → OrderComplete

**`src/components/TicketModal.tsx`**
- Remove quantity selector (Ticket Tailor handles this)
- Remove fake purchase flow and TODO toast
- Add Ticket Tailor widget script loading
- Replace "Buy" button with widget trigger

**`src/pages/Jukebox.tsx`**
- Use `useTickets` hook instead of local ticket state
- Remove `onBuyTickets` / `onPurchaseComplete` handlers

## Ticket Tailor Widget Integration

Load script and trigger widget:

```tsx
// Script (loaded once)
<script src="https://cdn.tickettailor.com/js/widgets/min/widget.js"></script>

// Button triggers widget
<button
  data-ticket-tailor-event="ev_7722196"
  data-ticket-tailor-callback="https://rockyoke.eyam.fun/order-complete"
>
  Buy Tickets
</button>
```

## localStorage Schema

```ts
interface TicketStorage {
  tickets: Array<{
    id: string;           // Order ID from Ticket Tailor
    purchasedAt: string;  // ISO timestamp
  }>;
  pendingConfirmation: boolean;  // Flag to show confetti on next page load
}
```

Key: `rockyoke-tickets`

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User cancels widget | No redirect, no changes |
| `/order-complete` without params | Redirect to `/` without confirmation |
| Duplicate order IDs | Check before adding, skip duplicates |
| localStorage unavailable | Graceful fallback, session-only tickets |

## Removed Code

- Fake ticket ID generation (`#RC-2025-XXXX`)
- "TODO: Payment Integration" toast
- Quantity selector in TicketModal
- `onBuyTickets` / `onPurchaseComplete` callback props

## Unchanged

- TicketConfirmationModal (confetti + ticket display)
- "View Tickets" flow for existing ticket holders
- Visual styling
