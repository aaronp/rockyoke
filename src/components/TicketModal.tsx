// src/components/TicketModal.tsx
import { useState } from "react";
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
  onBuyTickets: (quantity: number) => void;
  onPurchaseComplete?: (quantity: number) => void;
};

export function TicketModal({
  open,
  onOpenChange,
  eventName,
  venue,
  date,
  priceAdvance,
  ticketsOwned,
  ticketsRemaining,
  onBuyTickets,
  onPurchaseComplete,
}: TicketModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const nameParts = eventName.split(" ");
  const firstWord = nameParts[0];
  const remainingWords = nameParts.slice(1).join(" ");

  const handleBuy = () => {
    onBuyTickets(quantity);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onOpenChange(false);
      // Trigger confirmation modal after a brief delay
      setTimeout(() => {
        onPurchaseComplete?.(quantity);
      }, 100);
    }, 1000);
  };

  // Parse price for total calculation (assumes format like "£12")
  const priceNum = parseFloat(priceAdvance.replace(/[^0-9.]/g, "")) || 0;
  const currencySymbol = priceAdvance.replace(/[0-9.]/g, "") || "£";
  const total = `${currencySymbol}${(priceNum * quantity).toFixed(0)}`;

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

          {/* Quantity selector */}
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-900/50 text-xl font-bold text-amber-200 transition-colors hover:bg-amber-800/50"
            >
              −
            </button>
            <span className="min-w-[3rem] text-center text-3xl font-bold text-amber-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => Math.min(10, q + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-900/50 text-xl font-bold text-amber-200 transition-colors hover:bg-amber-800/50"
            >
              +
            </button>
          </div>

          {/* Price info */}
          <p className="mb-2 text-sm uppercase tracking-wide text-amber-400">
            {priceAdvance} each
          </p>
          <p className="mb-4 text-lg font-bold uppercase tracking-wide text-amber-200">
            Total: {total}
          </p>

          {/* Buy button */}
          <button
            onClick={handleBuy}
            className="w-full rounded-lg bg-amber-500 px-6 py-3 font-bold uppercase tracking-wide text-amber-950 transition-colors hover:bg-amber-400"
          >
            Buy {quantity} Ticket{quantity !== 1 ? "s" : ""}
          </button>

          {/* Toast */}
          {showToast && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/80">
              <div className="rounded-lg bg-amber-500 px-6 py-4 text-center">
                <p className="text-lg font-bold text-amber-950">TODO: Payment Integration</p>
                <p className="text-sm text-amber-900">Tickets added for demo</p>
              </div>
            </div>
          )}

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
