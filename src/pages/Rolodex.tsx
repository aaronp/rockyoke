import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, ArrowLeft, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Full song list - we'll show 6 at a time (3 top, 3 bottom)
const SONGS = [
  { no: 154, title: "Say It Loud - I'm Black and I'm Proud", artist: "James Brown", year: 1968 },
  { no: 175, title: "Yesterday", artist: "Ray Charles", year: 1967 },
  { no: 107, title: "At Last (I Found a Love)", artist: "Marvin Gaye", year: 1967 },
  { no: 254, title: "Say It Loud - I'm Black and I'm Proud Pt 2", artist: "James Brown", year: 1968 },
  { no: 275, title: "Never Had Enough of Nothing Yet", artist: "Ray Charles", year: 1967 },
  { no: 207, title: "Chained", artist: "Marvin Gaye", year: 1967 },
  { no: 164, title: "Brown Eyed Girl", artist: "Van Morrison", year: 1967 },
  { no: 185, title: "You're Love Is Wonderful", artist: "Four Tops", year: 1967 },
  { no: 117, title: "Why I Keep Living These Memories", artist: "Jean Knight", year: 1970 },
  { no: 264, title: "Goodbye Baby", artist: "Van Morrison", year: 1967 },
  { no: 285, title: "Walk Away Renee", artist: "Four Tops", year: 1967 },
  { no: 217, title: "Mr. Big Stuff", artist: "Jean Knight", year: 1971 },
  { no: 174, title: "There's a Kind of Hush", artist: "Herman's Hermits", year: 1967 },
  { no: 195, title: "Understanding", artist: "Ray Charles", year: 1968 },
  { no: 127, title: "I Can Hear You Calling", artist: "Three Dog Night", year: 1970 },
  { no: 274, title: "No Milk Today", artist: "Herman's Hermits", year: 1967 },
  { no: 295, title: "Eleanor Rigby", artist: "Ray Charles", year: 1968 },
  { no: 227, title: "Joy to the World", artist: "Three Dog Night", year: 1971 },
  { no: 134, title: "Respect", artist: "Aretha Franklin", year: 1967 },
  { no: 155, title: "Chain of Fools", artist: "Aretha Franklin", year: 1967 },
  { no: 137, title: "Think", artist: "Aretha Franklin", year: 1968 },
  { no: 234, title: "Natural Woman", artist: "Aretha Franklin", year: 1967 },
  { no: 255, title: "I Say a Little Prayer", artist: "Aretha Franklin", year: 1968 },
  { no: 237, title: "Rock Steady", artist: "Aretha Franklin", year: 1971 },
] as const;

type Song = (typeof SONGS)[number];

// Group songs into pages of 6 (3 top + 3 bottom)
function getPages(songs: readonly Song[]): { top: Song[]; bottom: Song[] }[] {
  const pages: { top: Song[]; bottom: Song[] }[] = [];
  for (let i = 0; i < songs.length; i += 6) {
    pages.push({
      top: songs.slice(i, i + 3) as Song[],
      bottom: songs.slice(i + 3, i + 6) as Song[],
    });
  }
  return pages;
}

// Sound effect hook for the mechanical clack
function useClackSfx() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  function getCtx() {
    if (!ctxRef.current) {
      // @ts-expect-error webkitAudioContext for Safari
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    return ctxRef.current;
  }

  async function resumeIfNeeded() {
    const ctx = getCtx();
    if (!ctx) return null;
    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch {
        // ignore
      }
    }
    return ctx;
  }

  function setEnabled(v: boolean) {
    enabledRef.current = v;
  }

  function clack(strength = 0.9) {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const t0 = ctx.currentTime;

    // low thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t0);
    osc.frequency.exponentialRampToValueAtTime(70, t0 + 0.08);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.18 * strength, t0 + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.14);

    // short snap
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.55;
    noise.buffer = buf;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(1400, t0);

    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.11 * strength, t0 + 0.004);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);

    noise.connect(hp);
    hp.connect(ng);
    ng.connect(ctx.destination);

    noise.start(t0 + 0.004);
    noise.stop(t0 + 0.06);
  }

  return { resumeIfNeeded, clack, setEnabled };
}

export default function Rolodex() {
  const pages = getPages(SONGS);
  const [pageIndex, setPageIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const sfx = useClackSfx();

  useEffect(() => {
    sfx.setEnabled(soundOn);
  }, [soundOn, sfx]);

  const canGoDown = pageIndex < pages.length - 1;
  const canGoUp = pageIndex > 0;

  const goDown = useCallback(async () => {
    if (!canGoDown) return;
    await sfx.resumeIfNeeded();
    sfx.clack(0.95);
    setPageIndex((i) => i + 1);
  }, [canGoDown, sfx]);

  const goUp = useCallback(async () => {
    if (!canGoUp) return;
    await sfx.resumeIfNeeded();
    sfx.clack(0.85);
    setPageIndex((i) => i - 1);
  }, [canGoUp, sfx]);

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

  const currentPage = pages[pageIndex];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
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
            <h1 className="text-2xl font-semibold">Jukebox Title Strips</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Classic split-flap with top &amp; bottom song panels.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="h-9 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-100 hover:bg-neutral-900"
              onClick={async () => {
                await sfx.resumeIfNeeded();
                setSoundOn((v) => !v);
              }}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              {soundOn ? "On" : "Off"}
            </Button>
            <div className="text-sm text-neutral-500 tabular-nums">
              Page {pageIndex + 1} / {pages.length}
            </div>
          </div>
        </div>

        {/* Jukebox Display */}
        <div className="rounded-3xl border-4 border-amber-600/80 bg-amber-500 p-3 shadow-[0_40px_120px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,255,255,0.3)]">
          {/* Inner frame */}
          <div className="relative overflow-hidden rounded-2xl bg-amber-600/50 p-2">
            {/* The split-flap mechanism */}
            <div style={{ perspective: "1200px" }}>
              <SplitFlapPanel page={currentPage} />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3 flex items-center justify-center gap-4">
            <Button
              className="h-12 rounded-xl border-2 border-amber-700 bg-amber-600 px-6 font-semibold text-amber-950 shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] hover:bg-amber-500 disabled:opacity-40"
              onClick={goUp}
              disabled={!canGoUp}
            >
              <ChevronUp className="mr-2 h-5 w-5" />
              Previous
            </Button>
            <Button
              className="h-12 rounded-xl border-2 border-amber-700 bg-amber-600 px-6 font-semibold text-amber-950 shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] hover:bg-amber-500 disabled:opacity-40"
              onClick={goDown}
              disabled={!canGoDown}
            >
              Next
              <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
          <div className="text-sm text-neutral-400">
            <strong className="text-neutral-200">How it works:</strong>
            <p className="mt-2">
              Top panel shows 3 songs, bottom panel shows 3 more. When you flip,
              the <span className="text-amber-400">top panel falls forward</span> and
              the <span className="text-amber-400">bottom panel rotates up</span>,
              revealing the next 6 songs.
            </p>
            <p className="mt-2">
              Press <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">↓</kbd> or{" "}
              <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-xs">↑</kbd> to flip.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Split-Flap Panel - shows top and bottom song panels
 */
function SplitFlapPanel({ page }: { page: { top: Song[]; bottom: Song[] } }) {
  return (
    <div className="relative select-none">
      {/* Static backplate - always shows the current content */}
      <div className="relative rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {/* TOP PANEL - static */}
        <div className="bg-gradient-to-b from-amber-100 to-amber-50">
          <SongStrips songs={page.top} />
        </div>

        {/* Seam / hinge line */}
        <div className="h-1 bg-gradient-to-b from-amber-800/60 via-amber-900/80 to-amber-800/60 shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />

        {/* BOTTOM PANEL - static */}
        <div className="bg-gradient-to-b from-amber-50 to-amber-100">
          <SongStrips songs={page.bottom} />
        </div>
      </div>

      {/* Animated flaps */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={page.top[0]?.no ?? "empty"} className="absolute inset-0">
          {/* TOP FLAP - falls forward */}
          <motion.div
            className="absolute inset-x-0 top-0 overflow-hidden rounded-t-xl"
            style={{
              height: "calc(50% - 2px)",
              transformStyle: "preserve-3d",
              transformOrigin: "center bottom",
              backfaceVisibility: "hidden",
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="h-full bg-gradient-to-b from-amber-100 to-amber-50 shadow-lg">
              <SongStrips songs={page.top} />
            </div>
          </motion.div>

          {/* BOTTOM FLAP - rotates up into place */}
          <motion.div
            className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-xl"
            style={{
              height: "calc(50% - 2px)",
              transformStyle: "preserve-3d",
              transformOrigin: "center top",
              backfaceVisibility: "hidden",
            }}
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.35, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="h-full bg-gradient-to-b from-amber-50 to-amber-100 shadow-lg">
              <SongStrips songs={page.bottom} />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Song Strips - renders 3 song title strips in a row
 */
function SongStrips({ songs }: { songs: Song[] }) {
  return (
    <div className="grid grid-cols-3 gap-px bg-amber-300/50 p-2">
      {songs.map((song, i) => (
        <SongCard key={song.no} song={song} index={i} />
      ))}
      {/* Fill empty slots */}
      {songs.length < 3 &&
        Array.from({ length: 3 - songs.length }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20 rounded bg-amber-100/50" />
        ))}
    </div>
  );
}

/**
 * Individual song card in the jukebox style
 */
function SongCard({ song }: { song: Song; index: number }) {
  return (
    <div className="relative overflow-hidden rounded bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_3px_rgba(0,0,0,0.2)]">
      {/* Top song number + title */}
      <div className="border-b border-amber-200/80 px-2 py-1">
        <div className="flex items-start gap-1.5">
          <span className="font-mono text-sm font-bold text-amber-900">{song.no}</span>
          <span className="flex-1 truncate text-xs font-semibold uppercase tracking-tight text-amber-950">
            {song.title}
          </span>
        </div>
      </div>

      {/* Artist line with flag */}
      <div className="flex items-center gap-1.5 bg-amber-200/40 px-2 py-1">
        {/* Red flag marker */}
        <div className="flex h-4 w-5 items-center justify-center">
          <div
            className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-red-600"
            style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))" }}
          />
        </div>
        <span className="flex-1 truncate text-xs font-bold uppercase text-amber-900">
          {song.artist} /{song.year}
        </span>
      </div>

      {/* Subtle paper texture */}
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
    </div>
  );
}
