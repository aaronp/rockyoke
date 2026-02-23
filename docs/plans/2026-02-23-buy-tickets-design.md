# Buy Tickets Feature Design

## Overview

Add "Buy Tickets" buttons to EventPoster and LineupPanel components, plus modify SignUpWizard to open a ticket purchase modal. The modal displays event details in a vintage poster style with a QR code linking to a Stripe Payment Link.

## Requirements

- "Buy Tickets" button on EventPoster (poster variant only)
- "Buy Tickets" button on LineupPanel (panel variant only)
- "Sign Up" button in SignUpWizard opens ticket modal instead of name entry
- Modal displays event details matching EventPoster aesthetic
- QR code links to configurable Stripe Payment Link URL
- No backend required (Payment Link created in Stripe dashboard)

## Architecture

### Component Structure

```
Jukebox.tsx
├── ticketModalOpen state (boolean)
├── openTicketModal() / closeTicketModal()
│
├── EventPoster (onBuyTickets prop)
├── LineupPanel (onBuyTickets prop)
├── SignUpWizard (onBuyTickets prop)
│
└── TicketModal (new component)
    ├── shadcn/ui Dialog
    ├── Vintage poster styling
    ├── Event details
    └── QR code (qrcode.react)
```

### Data Flow

1. User clicks "Buy Tickets" on any component
2. Component calls `onBuyTickets` prop
3. Jukebox.tsx sets `ticketModalOpen = true`
4. TicketModal renders with EVENT_DETAILS
5. User scans QR code → opens Stripe Payment Link
6. User closes modal or clicks backdrop

### Configuration

```typescript
const EVENT_DETAILS = {
  eventName: "Rockyoke Night!",
  venue: "The Mechanics",
  date: "2nd May",
  priceAdvance: "£12",
  priceDoor: "£15",
  paymentLinkUrl: "https://buy.stripe.com/your-link-here",
} as const;
```

## TicketModal Design

```
┌─────────────────────────────────────┐
│              ★ ─── ★                │
│                                     │
│           ROCKYOKE                  │
│             NIGHT!                  │
│                                     │
│         ───────────────             │
│                                     │
│          The Mechanics              │
│             2nd May                 │
│                                     │
│         ───────────────             │
│                                     │
│      ┌─────────────────┐            │
│      │   [QR CODE]     │            │
│      │                 │            │
│      └─────────────────┘            │
│                                     │
│       Scan to buy tickets           │
│       £12 advance / £15 door        │
│                                     │
│         ─── ★ ───                   │
└─────────────────────────────────────┘
```

- Matches EventPoster vintage aesthetic (amber/brown gradient background)
- QR code generated via `qrcode.react` library
- Close button (X) in corner

## Files to Modify/Create

| File | Action |
|------|--------|
| `src/components/TicketModal.tsx` | Create |
| `src/components/EventPoster.tsx` | Add button + onBuyTickets prop |
| `src/components/LineupPanel.tsx` | Add button + onBuyTickets prop |
| `src/components/jukebox/SignUpWizard.tsx` | Change Sign Up to call onBuyTickets |
| `src/pages/Jukebox.tsx` | Add modal state + pass props |
| `package.json` | Add qrcode.react dependency |

## Dependencies

- `qrcode.react` - QR code generation (lightweight, React-native)

## Setup Required

1. Create Stripe account
2. Create Payment Link in Stripe dashboard
3. Copy Payment Link URL to `EVENT_DETAILS.paymentLinkUrl`
