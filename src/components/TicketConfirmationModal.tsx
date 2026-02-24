// src/components/TicketConfirmationModal.tsx
import { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type TicketConfirmationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketIds: string[];
  showConfetti?: boolean;
  onBuyMore?: () => void;
  ticketsRemaining?: number;
};

export function TicketConfirmationModal({
  open,
  onOpenChange,
  ticketIds,
  showConfetti = true,
  onBuyMore,
  ticketsRemaining = 0,
}: TicketConfirmationModalProps) {
  // Fire confetti when modal opens (only if showConfetti is true)
  useEffect(() => {
    if (open && ticketIds.length > 0 && showConfetti) {
      // Fire a burst of confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#f59e0b", "#fbbf24", "#d97706", "#ef4444", "#10b981"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#f59e0b", "#fbbf24", "#d97706", "#ef4444", "#10b981"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      // Initial big burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#f59e0b", "#fbbf24", "#d97706", "#ef4444", "#10b981"],
      });

      frame();
    }
  }, [open, ticketIds.length, showConfetti]);

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
        <DialogTitle className="sr-only">
          {showConfetti ? "Tickets Confirmed" : "Your Tickets"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {showConfetti ? "Your tickets have been confirmed" : "View your purchased tickets"}
        </DialogDescription>

        <div className="flex flex-col items-center p-6">
          {/* Decorative top border */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-amber-500">★</span>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
            <span className="text-amber-500">★</span>
          </div>

          {/* Header */}
          <h2
            className={`mb-2 text-center font-bold uppercase tracking-widest ${showConfetti ? "text-green-400" : "text-amber-100"}`}
            style={{
              fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            {showConfetti ? "Tickets Confirmed!" : "Your Tickets"}
          </h2>

          {/* Divider */}
          <div className="mb-4 h-px w-3/4 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

          {/* Ticket numbers */}
          <div className="mb-4 w-full space-y-2">
            <p className="text-center text-xs uppercase tracking-wide text-amber-400">
              Your Ticket{ticketIds.length !== 1 ? "s" : ""}
            </p>
            <div className="rounded-lg bg-neutral-900/60 p-3">
              {ticketIds.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-center gap-2 py-1"
                >
                  <span className="text-amber-500">★</span>
                  <span className="font-mono text-lg font-bold tracking-wider text-amber-100">
                    {id}
                  </span>
                  <span className="text-amber-500">★</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px w-1/2 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

          {showConfetti ? (
            <>
              {/* Encouraging message */}
              <p className="mb-6 max-w-[280px] text-center text-sm text-amber-200">
                Now pick a song and sign up to sing while there&apos;s spaces!
              </p>

              {/* Dismiss button */}
              <button
                onClick={() => onOpenChange(false)}
                className="w-full rounded-lg bg-amber-500 px-6 py-3 font-bold uppercase tracking-wide text-amber-950 transition-colors hover:bg-amber-400"
              >
                Got it!
              </button>
            </>
          ) : (
            <>
              {/* Remaining sign-ups info */}
              <div className="mb-4 rounded-lg bg-neutral-800/60 px-4 py-2 text-center">
                <p className="text-sm font-semibold text-amber-200">
                  {ticketsRemaining} sign-up{ticketsRemaining !== 1 ? "s" : ""} remaining
                </p>
              </div>

              {/* Buttons */}
              <div className="flex w-full gap-3">
                <button
                  onClick={() => onOpenChange(false)}
                  className="flex-1 rounded-lg border border-amber-700 bg-transparent px-4 py-3 font-bold uppercase tracking-wide text-amber-400 transition-colors hover:bg-amber-900/30"
                >
                  Close
                </button>
                {onBuyMore && (
                  <button
                    onClick={() => {
                      onOpenChange(false);
                      onBuyMore();
                    }}
                    className="flex-1 rounded-lg bg-amber-500 px-4 py-3 font-bold uppercase tracking-wide text-amber-950 transition-colors hover:bg-amber-400"
                  >
                    Buy More
                  </button>
                )}
              </div>
            </>
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
