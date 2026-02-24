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
