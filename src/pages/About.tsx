import { Link } from "react-router-dom";
import backgroundImage from "../background.png";

const EVENT_DETAILS = {
  eventName: "Rockyoke Night!",
  venue: "The VeeCee",
  date: "Friday 20th June 2025",
  doors: "7:30 PM",
  priceAdvance: "£12",
  priceDoor: "£15",
};

export default function About() {
  return (
    <div
      className="relative min-h-screen text-neutral-100 overflow-x-hidden overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-neutral-950/85" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-12">
        {/* Back link */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-amber-400 transition-colors hover:text-amber-300"
        >
          ← Back to Jukebox
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
          <h1
            className="mb-2 font-bold uppercase tracking-widest text-amber-100"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Rockyoke
          </h1>
          <p className="text-lg font-semibold uppercase tracking-wider text-amber-300">
            Night!
          </p>
          <div className="mx-auto mt-4 h-px w-1/2 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />
        </div>

        {/* What is it */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-amber-400">
            What is Rockyoke?
          </h2>
          <p className="mb-3 text-base leading-relaxed text-amber-100/90">
            Rockyoke is karaoke with a live band! Come along for a fun night of
            live music — enjoy the show, or get up on stage and sing with the
            band yourself.
          </p>
          <p className="text-base leading-relaxed text-amber-100/90">
            Whether you're a seasoned performer or a first-timer, the band will
            back you on your favourite rock and pop classics. It's all about
            having a great time!
          </p>
        </section>

        {/* Event details */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-amber-400">
            Event Details
          </h2>
          <div className="rounded-lg border border-amber-900/40 bg-amber-950/30 p-5">
            <dl className="space-y-2 text-base">
              <div className="flex justify-between">
                <dt className="font-semibold text-amber-300">Venue</dt>
                <dd className="text-amber-100">{EVENT_DETAILS.venue}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-amber-300">Date</dt>
                <dd className="text-amber-100">{EVENT_DETAILS.date}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-amber-300">Doors</dt>
                <dd className="text-amber-100">{EVENT_DETAILS.doors}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-amber-300">Advance</dt>
                <dd className="text-amber-100">{EVENT_DETAILS.priceAdvance}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-amber-300">On the door</dt>
                <dd className="text-amber-100">{EVENT_DETAILS.priceDoor}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-amber-400">
            How It Works
          </h2>
          <ol className="list-inside list-decimal space-y-2 text-base leading-relaxed text-amber-100/90">
            <li>
              <span className="font-semibold text-amber-200">Browse the jukebox</span>{" "}
              — flip through the song catalog and find your favourites.
            </li>
            <li>
              <span className="font-semibold text-amber-200">Pick your songs</span>{" "}
              — select the songs you'd love to perform from the checklist.
            </li>
            <li>
              <span className="font-semibold text-amber-200">Buy a ticket</span>{" "}
              — grab your ticket in advance to secure your spot.
            </li>
            <li>
              <span className="font-semibold text-amber-200">Show up and sing!</span>{" "}
              — the band will do their best to play your requests on the night.
            </li>
          </ol>
        </section>

        {/* Song requests disclaimer */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-amber-400">
            Song Requests
          </h2>
          <p className="mb-3 text-base leading-relaxed text-amber-100/90">
            Song choices are requests only and not guaranteed. The band will do
            their best to accommodate your preferences on the night. If your
            song isn't in the catalog, you can submit a custom request — the
            band will see what they can do!
          </p>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold uppercase tracking-wide text-amber-400">
            Questions?
          </h2>
          <p className="text-base leading-relaxed text-amber-100/90">
            Got a question about the event, tickets, or song requests?{" "}
            <a
              href="mailto:rockyoke@example.com"
              className="font-semibold text-amber-400 underline decoration-amber-600 underline-offset-2 hover:text-amber-300"
            >
              Get in touch
            </a>
            {" "}and we'll get back to you.
          </p>
        </section>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-block rounded-lg bg-amber-500 px-8 py-3 text-lg font-bold uppercase tracking-wide text-amber-950 transition-colors hover:bg-amber-400"
          >
            Go to the Jukebox
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          <span className="text-xs text-amber-600">★</span>
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        </div>
      </div>
    </div>
  );
}
