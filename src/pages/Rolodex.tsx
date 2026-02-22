import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SONGS = [
  { no: 11, title: "Don't Stop Me Now", artist: "Queen", len: "3:29", vibe: "Crowd-pleaser" },
  { no: 12, title: "Mr. Brightside", artist: "The Killers", len: "3:42", vibe: "Belter" },
  { no: 13, title: "Valerie", artist: "Amy Winehouse", len: "3:40", vibe: "Groove" },
  { no: 14, title: "Wonderwall", artist: "Oasis", len: "4:18", vibe: "Singalong" },
  { no: 15, title: "Livin' on a Prayer", artist: "Bon Jovi", len: "4:11", vibe: "Hands up" },
  { no: 16, title: "Proud Mary", artist: "Tina Turner", len: "5:26", vibe: "Showstopper" },
  { no: 17, title: "Superstition", artist: "Stevie Wonder", len: "4:26", vibe: "Funk" },
  { no: 18, title: "Rolling in the Deep", artist: "Adele", len: "3:49", vibe: "Power" },
  { no: 19, title: "I Wanna Dance with Somebody", artist: "Whitney Houston", len: "4:52", vibe: "Party" },
  { no: 20, title: "Take On Me", artist: "a-ha", len: "3:48", vibe: "High notes" },
] as const;

type Song = (typeof SONGS)[number];

function formatNo(n: number) {
  return String(n).padStart(2, "0");
}

export default function Rolodex() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"up" | "down">("down");

  const goDown = useCallback(() => {
    if (currentIndex < SONGS.length - 1) {
      setDirection("down");
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex]);

  const goUp = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("up");
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        goDown();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        goUp();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goDown, goUp]);

  // Get visible cards (current + next few for depth)
  const visibleCards = SONGS.slice(currentIndex, currentIndex + 4);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              to="/"
              className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Rockyoke
            </Link>
            <h1 className="text-2xl font-semibold">Rolodex Component</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Isolated fall-forward card flipper. Use arrow keys or buttons.
            </p>
          </div>
          <div className="text-right text-sm text-neutral-500">
            <div className="tabular-nums">
              {currentIndex + 1} / {SONGS.length}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            className="h-12 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-6 text-neutral-100 hover:bg-neutral-900"
            onClick={goUp}
            disabled={currentIndex === 0}
          >
            <ChevronUp className="mr-2 h-5 w-5" />
            Up (flip back)
          </Button>
          <Button
            variant="secondary"
            className="h-12 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-6 text-neutral-100 hover:bg-neutral-900"
            onClick={goDown}
            disabled={currentIndex === SONGS.length - 1}
          >
            <ChevronDown className="mr-2 h-5 w-5" />
            Down (flip forward)
          </Button>
        </div>

        {/* Rolodex Container */}
        <div
          className="relative mx-auto h-[400px] w-full max-w-xl"
          style={{ perspective: "1200px" }}
        >
          {/* Stack of cards - render back to front */}
          {visibleCards
            .slice()
            .reverse()
            .map((song, reversedIdx) => {
              const stackIdx = visibleCards.length - 1 - reversedIdx;
              const isTop = stackIdx === 0;

              return (
                <RolodexCard
                  key={song.no}
                  song={song}
                  stackIndex={stackIdx}
                  isTop={isTop}
                  direction={direction}
                  totalInStack={visibleCards.length}
                />
              );
            })}

          {/* Exiting card animation */}
          <AnimatePresence mode="popLayout">
            {direction === "down" && (
              <ExitingCard
                key={`exit-${currentIndex}`}
                song={SONGS[currentIndex - 1]}
                direction="down"
              />
            )}
            {direction === "up" && (
              <EnteringCard
                key={`enter-${currentIndex}`}
                song={SONGS[currentIndex]}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
          <div className="text-sm text-neutral-400">
            <strong className="text-neutral-200">Controls:</strong>
            <ul className="mt-2 space-y-1">
              <li>
                <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">↓</kbd> or{" "}
                <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">j</kbd> — Flip card forward (next song)
              </li>
              <li>
                <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">↑</kbd> or{" "}
                <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">k</kbd> — Flip card back (previous song)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function RolodexCard({
  song,
  stackIndex,
  isTop,
  totalInStack,
}: {
  song: Song;
  stackIndex: number;
  isTop: boolean;
  direction: "up" | "down";
  totalInStack: number;
}) {
  // Cards stack with slight offset - cards behind are slightly higher and smaller
  const yOffset = stackIndex * -8;
  const scale = 1 - stackIndex * 0.03;
  const zIndex = totalInStack - stackIndex;
  const opacity = 1 - stackIndex * 0.15;

  return (
    <motion.div
      className="absolute inset-x-0 top-1/2"
      style={{
        zIndex,
        transformStyle: "preserve-3d",
        transformOrigin: "center top",
      }}
      initial={false}
      animate={{
        y: yOffset,
        scale,
        opacity,
        rotateX: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <CardContent song={song} isTop={isTop} />
    </motion.div>
  );
}

function ExitingCard({
  song,
  direction,
}: {
  song?: Song;
  direction: "up" | "down";
}) {
  if (!song) return null;

  return (
    <motion.div
      className="absolute inset-x-0 top-1/2"
      style={{
        zIndex: 100,
        transformStyle: "preserve-3d",
        transformOrigin: "center top",
      }}
      initial={{
        rotateX: 0,
        y: 0,
        opacity: 1,
      }}
      animate={{
        rotateX: direction === "down" ? -90 : 90,
        y: direction === "down" ? 100 : -100,
        opacity: 0,
      }}
      exit={{
        rotateX: direction === "down" ? -90 : 90,
        y: direction === "down" ? 100 : -100,
        opacity: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
    >
      <CardContent song={song} isTop />
    </motion.div>
  );
}

function EnteringCard({ song }: { song: Song }) {
  return (
    <motion.div
      className="absolute inset-x-0 top-1/2"
      style={{
        zIndex: 100,
        transformStyle: "preserve-3d",
        transformOrigin: "center bottom",
      }}
      initial={{
        rotateX: 90,
        y: -100,
        opacity: 0,
      }}
      animate={{
        rotateX: 0,
        y: 0,
        opacity: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
    >
      <CardContent song={song} isTop />
    </motion.div>
  );
}

function CardContent({ song, isTop }: { song: Song; isTop: boolean }) {
  return (
    <div
      className={
        "relative -translate-y-1/2 overflow-hidden rounded-2xl border shadow-[0_25px_80px_rgba(0,0,0,0.5)] " +
        (isTop
          ? "border-amber-500/50 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800"
          : "border-neutral-700 bg-neutral-900")
      }
    >
      {/* Dot grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Song number */}
          <div
            className={
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border font-mono text-xl tabular-nums " +
              (isTop
                ? "border-amber-500/40 bg-neutral-950 text-amber-400"
                : "border-neutral-700 bg-neutral-950/50 text-neutral-300")
            }
          >
            {formatNo(song.no)}
          </div>

          {/* Song info */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-semibold text-neutral-100">
              {song.title}
            </h3>
            <p className="mt-1 truncate text-base text-neutral-400">
              {song.artist}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={
                  "rounded-full border-neutral-700 bg-neutral-800/80 text-neutral-200 " +
                  (isTop ? "border-amber-500/30" : "")
                }
              >
                {song.vibe}
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full border-neutral-700 bg-neutral-800/80 text-neutral-300"
              >
                {song.len}
              </Badge>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-6 h-1 w-full rounded-full bg-gradient-to-r from-amber-500/20 via-fuchsia-500/15 to-cyan-500/20" />
      </div>

      {/* Side shine effect */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white/5 via-transparent to-transparent" />
    </div>
  );
}
