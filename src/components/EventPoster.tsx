// src/components/EventPoster.tsx

type EventPosterProps = {
  eventName: string;
  venue: string;
  date: string;
  priceAdvance: string;
  priceDoor: string;
  variant: "poster" | "banner";
  className?: string;
  onBuyTickets?: () => void;
  ticketsOwned?: number;
};

export function EventPoster({
  eventName,
  venue,
  date,
  priceAdvance,
  priceDoor,
  variant,
  className = "",
  onBuyTickets,
  ticketsOwned = 0,
}: EventPosterProps) {
  if (variant === "banner") {
    return (
      <div
        className={`bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-4 py-2 text-center ${className}`}
      >
        <p className="text-base font-bold uppercase tracking-wider text-amber-300">
          ROCKYOKE!
        </p>
        <p className="text-xs italic text-amber-200/80">
          Come for a fun night of live music, or to sing with the band!
        </p>
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-100">
          {venue} - {date}
        </p>
        <p className="text-xs uppercase tracking-wide text-amber-400">
          {priceAdvance} in advance, {priceDoor} on the door
        </p>
      </div>
    );
  }

  const nameParts = eventName.split(" ");
  const firstWord = nameParts[0];
  const remainingWords = nameParts.slice(1).join(" ");

  return (
    <div
      className={`flex h-full flex-col items-center justify-center rounded-lg p-6 ${className}`}
      style={{
        background: `
          linear-gradient(135deg, rgba(60, 20, 10, 0.95) 0%, rgba(40, 15, 8, 0.98) 50%, rgba(30, 10, 5, 0.95) 100%),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          )
        `,
        boxShadow: "inset 0 0 60px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Decorative top border */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-amber-500">★</span>
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        <span className="text-amber-500">★</span>
      </div>

      {/* Event name */}
      <h1
        className="mb-1 text-center font-bold uppercase tracking-widest text-amber-100"
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        {firstWord}
      </h1>
      {remainingWords && (
        <h2
          className="mb-4 text-center font-bold uppercase tracking-wider text-amber-200"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
          }}
        >
          {remainingWords}
        </h2>
      )}

      {/* Tagline */}
      <p className="mb-6 max-w-[220px] text-center text-sm italic text-amber-300/80">
        Come for a fun night of live music, or to sing with the band!
      </p>

      {/* Divider */}
      <div className="mb-6 h-px w-3/4 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

      {/* Venue */}
      <p
        className="mb-2 text-center font-semibold uppercase tracking-wide text-amber-100"
        style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)" }}
      >
        {venue}
      </p>

      {/* Date */}
      <p
        className="mb-6 text-center font-bold uppercase tracking-widest text-amber-300"
        style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
      >
        {date}
      </p>

      {/* Divider */}
      <div className="mb-6 h-px w-1/2 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

      {/* Pricing */}
      <div className="text-center">
        <p className="text-sm uppercase tracking-wide text-amber-400">
          {priceAdvance} advance
        </p>
        <p className="text-sm uppercase tracking-wide text-amber-400">
          {priceDoor} on the door
        </p>
      </div>

      {/* Buy Tickets Button */}
      {onBuyTickets && (
        <button
          onClick={onBuyTickets}
          className="mt-4 rounded-lg bg-amber-500 px-6 py-2 font-bold uppercase tracking-wide text-amber-950 transition-colors hover:bg-amber-400"
        >
          {ticketsOwned > 0 ? "Tickets" : "Buy Tickets"}
        </button>
      )}

      {/* Decorative bottom border */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        <span className="text-xs text-amber-600">★</span>
        <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
      </div>
    </div>
  );
}
