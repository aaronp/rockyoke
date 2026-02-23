# Buy Tickets Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "Buy Tickets" buttons to EventPoster, LineupPanel, and SignUpWizard that open a modal with event details and a QR code linking to Stripe Payment Link.

**Architecture:** Shared TicketModal component controlled by state in Jukebox.tsx. Each trigger component receives an `onBuyTickets` callback prop. Modal uses Radix Dialog primitive with vintage poster styling and qrcode.react for QR generation.

**Tech Stack:** React, TypeScript, Tailwind CSS, @radix-ui/react-dialog, qrcode.react

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install @radix-ui/react-dialog**

Run: `npm install @radix-ui/react-dialog`
Expected: Package added to dependencies

**Step 2: Install qrcode.react**

Run: `npm install qrcode.react`
Expected: Package added to dependencies

**Step 3: Verify installation**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @radix-ui/react-dialog and qrcode.react"
```

---

### Task 2: Create Dialog UI Component

**Files:**
- Create: `src/components/ui/dialog.tsx`

**Step 1: Create the Dialog component**

```tsx
// src/components/ui/dialog.tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/ui/dialog.tsx
git commit -m "feat: add Dialog UI component"
```

---

### Task 3: Create TicketModal Component

**Files:**
- Create: `src/components/TicketModal.tsx`

**Step 1: Create the TicketModal component**

```tsx
// src/components/TicketModal.tsx
import { QRCodeSVG } from "qrcode.react";
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
  paymentLinkUrl: string;
};

export function TicketModal({
  open,
  onOpenChange,
  eventName,
  venue,
  date,
  priceAdvance,
  priceDoor,
  paymentLinkUrl,
}: TicketModalProps) {
  const nameParts = eventName.split(" ");
  const firstWord = nameParts[0];
  const remainingWords = nameParts.slice(1).join(" ");

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
          Scan the QR code to purchase tickets for {eventName}
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

          {/* QR Code */}
          <div className="mb-4 rounded-lg bg-white p-4">
            <QRCodeSVG
              value={paymentLinkUrl}
              size={160}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Instructions */}
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-amber-200">
            Scan to buy tickets
          </p>

          {/* Pricing */}
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-amber-400">
              {priceAdvance} advance
            </p>
            <p className="text-sm uppercase tracking-wide text-amber-400">
              {priceDoor} on the door
            </p>
          </div>

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

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/TicketModal.tsx
git commit -m "feat: add TicketModal component with QR code"
```

---

### Task 4: Add Buy Tickets Button to EventPoster

**Files:**
- Modify: `src/components/EventPoster.tsx`

**Step 1: Add onBuyTickets prop and button**

Update the type definition to add the optional prop:

```tsx
type EventPosterProps = {
  eventName: string;
  venue: string;
  date: string;
  priceAdvance: string;
  priceDoor: string;
  variant: "poster" | "banner";
  className?: string;
  onBuyTickets?: () => void;
};
```

Update the function signature:

```tsx
export function EventPoster({
  eventName,
  venue,
  date,
  priceAdvance,
  priceDoor,
  variant,
  className = "",
  onBuyTickets,
}: EventPosterProps) {
```

**Step 2: Add button after pricing section (before decorative bottom border)**

Insert after the closing `</div>` of the pricing section (line 118) and before the decorative bottom border comment:

```tsx
      {/* Buy Tickets Button */}
      {onBuyTickets && (
        <button
          onClick={onBuyTickets}
          className="mt-4 rounded-lg bg-amber-500 px-6 py-2 font-bold uppercase tracking-wide text-amber-950 transition-colors hover:bg-amber-400"
        >
          Buy Tickets
        </button>
      )}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/EventPoster.tsx
git commit -m "feat: add Buy Tickets button to EventPoster"
```

---

### Task 5: Add Buy Tickets Button to LineupPanel

**Files:**
- Modify: `src/components/LineupPanel.tsx`

**Step 1: Add onBuyTickets prop**

Update the type definition:

```tsx
type LineupPanelProps = {
  queue: QueueEntry[];
  variant: "panel" | "section";
  className?: string;
  onBuyTickets?: () => void;
};
```

Update the function signature:

```tsx
export function LineupPanel({
  queue,
  variant,
  className = "",
  onBuyTickets,
}: LineupPanelProps) {
```

**Step 2: Add button at bottom of panel (inside the outer div, after queue list div)**

Insert before the closing `</div>` of the outer container:

```tsx
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
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/LineupPanel.tsx
git commit -m "feat: add Buy Tickets button to LineupPanel"
```

---

### Task 6: Add onBuyTickets to SignUpWizard

**Files:**
- Modify: `src/components/jukebox/SignUpWizard.tsx`

**Step 1: Add onBuyTickets prop to Props type**

Add to the Props type (around line 70-84):

```tsx
type Props = {
  wizardState: WizardState;
  selectedSong: Song | null;
  lastEntry: QueueEntry | null;
  onStartSignUp: () => void;
  onSubmitName: (name: string) => void;
  onSubmitPayment: () => void;
  onReset: () => void;
  onPreviewStart?: () => void;
  onPreviewEnd?: () => void;
  triggerPlayAudio?: boolean;
  queue?: QueueEntry[];
  codeInput?: string;
  codeDisplayState?: DisplayState;
  onBuyTickets?: () => void;
};
```

**Step 2: Destructure the new prop**

Update the function signature (around line 86-100):

```tsx
export function SignUpWizard({
  wizardState,
  selectedSong,
  lastEntry,
  onStartSignUp,
  onSubmitName,
  onSubmitPayment,
  onReset,
  onPreviewStart,
  onPreviewEnd,
  triggerPlayAudio,
  queue = [],
  codeInput = "",
  codeDisplayState = "normal",
  onBuyTickets,
}: Props) {
```

**Step 3: Change Sign Up button to call onBuyTickets**

Find the Sign Up button (around line 202-208) and change `onClick={onStartSignUp}` to `onClick={onBuyTickets ?? onStartSignUp}`:

```tsx
                <Button
                  size="sm"
                  onClick={onBuyTickets ?? onStartSignUp}
                  className="h-8 bg-rose-600 px-3 text-xs hover:bg-rose-500"
                >
                  Sign Up
                </Button>
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/jukebox/SignUpWizard.tsx
git commit -m "feat: add onBuyTickets callback to SignUpWizard"
```

---

### Task 7: Wire Everything Up in Jukebox.tsx

**Files:**
- Modify: `src/pages/Jukebox.tsx`

**Step 1: Add paymentLinkUrl to EVENT_DETAILS**

Update the constant (around line 18-24):

```tsx
const EVENT_DETAILS = {
  eventName: "Rockyoke Night!",
  venue: "The Mechanics",
  date: "2nd May",
  priceAdvance: "£12",
  priceDoor: "£15",
  paymentLinkUrl: "https://buy.stripe.com/test_placeholder",
} as const;
```

**Step 2: Add TicketModal import**

Add to imports at top of file:

```tsx
import { TicketModal } from "@/components/TicketModal";
```

**Step 3: Add modal state**

Inside the Jukebox component, after the existing useState calls (around line 28-32), add:

```tsx
const [ticketModalOpen, setTicketModalOpen] = useState(false);
```

**Step 4: Add onBuyTickets prop to EventPoster (poster variant)**

Find the EventPoster with variant="poster" (around line 91-95) and add the prop:

```tsx
            <EventPoster
              {...EVENT_DETAILS}
              variant="poster"
              onBuyTickets={() => setTicketModalOpen(true)}
            />
```

**Step 5: Add onBuyTickets prop to both LineupPanel instances**

Find the LineupPanel components (around line 160-168) and add the prop to both:

```tsx
              <LineupPanel
                queue={state.queue}
                variant="panel"
                className="hidden lg:flex lg:h-[600px]"
                onBuyTickets={() => setTicketModalOpen(true)}
              />
              <LineupPanel
                queue={state.queue}
                variant="section"
                className="lg:hidden"
                onBuyTickets={() => setTicketModalOpen(true)}
              />
```

**Step 6: Add onBuyTickets prop to SignUpWizard**

Find the SignUpWizard component (around line 137-151) and add the prop:

```tsx
              songQueue={
                <SignUpWizard
                  wizardState={state.wizardState}
                  selectedSong={state.selectedSong}
                  lastEntry={state.lastEntry}
                  onStartSignUp={state.startSignUp}
                  onSubmitName={state.submitName}
                  onSubmitPayment={state.submitPayment}
                  onReset={state.reset}
                  onPreviewStart={handlePreviewStart}
                  onPreviewEnd={handlePreviewEnd}
                  triggerPlayAudio={needleDown}
                  queue={state.queue}
                  codeInput={codeInput}
                  codeDisplayState={codeDisplayState}
                  onBuyTickets={() => setTicketModalOpen(true)}
                />
              }
```

**Step 7: Add TicketModal component**

Add the TicketModal at the end of the return statement, just before the final closing `</div>`:

```tsx
      {/* Ticket Modal */}
      <TicketModal
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        {...EVENT_DETAILS}
      />
    </div>
  );
}
```

**Step 8: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 9: Commit**

```bash
git add src/pages/Jukebox.tsx
git commit -m "feat: wire up TicketModal to all Buy Tickets buttons"
```

---

### Task 8: Visual Testing

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test EventPoster button**

- Open browser at http://localhost:5173/rockyoke/
- On wide screen, click "Buy Tickets" on left poster
- Verify: Modal opens with event details and QR code
- Click X or outside modal to close

**Step 3: Test LineupPanel button**

- Click "Buy Tickets" on right lineup panel
- Verify: Same modal opens

**Step 4: Test SignUpWizard button**

- Browse songs using ▲/▼ buttons
- Click on a song to select it
- Click "Sign Up" button
- Verify: Ticket modal opens (instead of name entry form)

**Step 5: Test narrow screen**

- Resize to narrow screen
- Verify: Banner at top (no button)
- Verify: LineupPanel section at bottom has button

**Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: visual testing adjustments"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Install dependencies | `package.json` |
| 2 | Create Dialog UI component | `src/components/ui/dialog.tsx` |
| 3 | Create TicketModal component | `src/components/TicketModal.tsx` |
| 4 | Add button to EventPoster | `src/components/EventPoster.tsx` |
| 5 | Add button to LineupPanel | `src/components/LineupPanel.tsx` |
| 6 | Add callback to SignUpWizard | `src/components/jukebox/SignUpWizard.tsx` |
| 7 | Wire up in Jukebox | `src/pages/Jukebox.tsx` |
| 8 | Visual testing | - |
