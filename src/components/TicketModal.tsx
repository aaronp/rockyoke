// src/components/TicketModal.tsx
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SongChecklist } from "@/components/SongChecklist";
import type { SelectedSong } from "@/types/jukebox";

type TicketModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  venue: string;
  date: string;
  priceAdvance: string;
  ticketsOwned: number;
  ticketsRemaining: number;
  selectedSongs: SelectedSong[];
  onToggleSong: (song: SelectedSong) => void;
};

// Load Ticket Tailor widget script
function loadTicketTailorScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="tickettailor.com"]')) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.tickettailor.com/js/widgets/min/widget.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Ticket Tailor script"));
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
  selectedSongs,
  onToggleSong,
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
    try {
      await loadTicketTailorScript();
    } catch (error) {
      console.error("Failed to load Ticket Tailor:", error);
      // Open Ticket Tailor page directly as fallback
      window.open("https://www.tickettailor.com/events/rockyoke/ev_7722196", "_blank");
      onOpenChange(false);
      return;
    }

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
    } else {
      // Widget not available, open Ticket Tailor page directly
      window.open("https://www.tickettailor.com/events/rockyoke/ev_7722196", "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-amber-900/50 p-0 sm:max-w-2xl max-h-[90vh] overflow-y-auto"
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
          <p className="mb-1 text-center text-lg font-semibold uppercase tracking-wide text-amber-100">
            {venue}
          </p>
          <p className="mb-4 text-center text-xl font-bold uppercase tracking-widest text-amber-300">
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
          <p className="mb-4 text-base uppercase tracking-wide text-amber-400">
            {priceAdvance} advance
          </p>

          {/* Song selection */}
          <div className="mb-4 w-full">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-400">
              Pick your songs
            </p>
            <SongChecklist
              selectedSongs={selectedSongs}
              onToggleSong={onToggleSong}
            />
            <p className="mt-3 text-center text-sm italic text-amber-600">
              Song choices are requests only and not guaranteed. The band will do their best to accommodate your preferences on the night.
            </p>
          </div>

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
