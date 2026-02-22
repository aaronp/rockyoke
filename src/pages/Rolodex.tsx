import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, ArrowLeft, Volume2 } from "lucide-react";
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

  return { resumeIfNeeded, clack, setEnabled, isEnabled: () => enabledRef.current };
}

export default function Rolodex() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const sfx = useClackSfx();

  useEffect(() => {
    sfx.setEnabled(soundOn);
  }, [soundOn, sfx]);

  const canGoDown = currentIndex < SONGS.length - 1;
  const canGoUp = currentIndex > 0;

  const goDown = useCallback(async () => {
    if (!canGoDown) return;
    await sfx.resumeIfNeeded();
    sfx.clack(0.95);
    setCurrentIndex((i) => i + 1);
  }, [canGoDown, sfx]);

  const goUp = useCallback(async () => {
    if (!canGoUp) return;
    await sfx.resumeIfNeeded();
    sfx.clack(0.85);
    setCurrentIndex((i) => i - 1);
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

  const currentSong = SONGS[currentIndex];

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
            <h1 className="text-2xl font-semibold">Split-Flap Display</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Old-school alarm clock / departure board mechanism.
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
              {currentIndex + 1} / {SONGS.length}
            </div>
          </div>
        </div>

        {/* Split-Flap Display */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/50 to-neutral-950 p-6">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />

            {/* The split-flap card */}
            <div className="relative mx-auto max-w-md" style={{ perspective: "1000px" }}>
              <SplitFlapCard song={currentSong} />
            </div>

            {/* Mechanical details - mounting screws */}
            <div className="pointer-events-none absolute left-4 top-4 h-2 w-2 rounded-full bg-neutral-700/50" />
            <div className="pointer-events-none absolute right-4 top-4 h-2 w-2 rounded-full bg-neutral-700/50" />
            <div className="pointer-events-none absolute bottom-4 left-4 h-2 w-2 rounded-full bg-neutral-700/50" />
            <div className="pointer-events-none absolute bottom-4 right-4 h-2 w-2 rounded-full bg-neutral-700/50" />
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-8 text-neutral-100 hover:bg-neutral-900 disabled:opacity-40"
              onClick={goUp}
              disabled={!canGoUp}
            >
              <ChevronUp className="mr-2 h-5 w-5" />
              Previous
            </Button>
            <Button
              variant="secondary"
              className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-8 text-neutral-100 hover:bg-neutral-900 disabled:opacity-40"
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
              Like an old alarm clock or airport departure board: the card splits horizontally.
              The <span className="text-amber-400">top flap falls forward</span> (hinged at the seam),
              while the <span className="text-cyan-400">bottom flap rotates up</span> into place.
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
 * Split-Flap Card
 *
 * The card is split horizontally in the middle.
 * - Top half: shows upper portion of content, hinged at bottom (falls forward)
 * - Bottom half: shows lower portion of content, hinged at top (flips up)
 */
function SplitFlapCard({ song }: { song: Song }) {
  const cardHeight = 200; // total card height
  const halfHeight = cardHeight / 2;

  return (
    <div
      className="relative select-none"
      style={{ height: cardHeight }}
    >
      {/* Static backplate - always shows the current content behind the flaps */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
        <CardContent song={song} />
      </div>

      {/* The split seam line */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-black/80" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px translate-y-0 bg-white/10" />

      {/* Animated flaps */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={song.no} className="absolute inset-0">
          {/* TOP FLAP - falls forward, hinged at bottom of top half */}
          <motion.div
            className="absolute inset-x-0 top-0 overflow-hidden rounded-t-2xl bg-neutral-950"
            style={{
              height: halfHeight,
              transformStyle: "preserve-3d",
              transformOrigin: "center bottom",
              backfaceVisibility: "hidden",
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="absolute inset-0 border border-neutral-800 border-b-0 rounded-t-2xl overflow-hidden">
              <CardContent song={song} clipHalf="top" />
            </div>
            {/* Highlight on top flap */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/8 to-transparent" />
          </motion.div>

          {/* BOTTOM FLAP - rotates up into place, hinged at top of bottom half */}
          <motion.div
            className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-2xl bg-neutral-950"
            style={{
              height: halfHeight,
              transformStyle: "preserve-3d",
              transformOrigin: "center top",
              backfaceVisibility: "hidden",
            }}
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.3, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="absolute inset-0 border border-neutral-800 border-t-0 rounded-b-2xl overflow-hidden">
              <CardContent song={song} clipHalf="bottom" />
            </div>
            {/* Shadow on bottom flap */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Glass reflection overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-32 rotate-12 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent blur-2xl" />

      {/* Corner details */}
      <div className="pointer-events-none absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-white/20" />
      <div className="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-white/20" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-white/20" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-white/20" />
    </div>
  );
}

/**
 * Card content - the actual song info
 * clipHalf: which half to show (for the animated flaps)
 */
function CardContent({ song, clipHalf }: { song: Song; clipHalf?: "top" | "bottom" }) {
  // When clipping, we need to position the content so only half shows
  const clipStyle: React.CSSProperties = clipHalf === "bottom"
    ? { position: "absolute", top: "-100%", left: 0, right: 0, bottom: 0 }
    : {};

  return (
    <div className="relative h-[200px] p-5" style={clipStyle}>
      {/* Dot grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:12px_12px]" />

      <div className="relative flex h-full items-center gap-4">
        {/* Song number */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-neutral-950 font-mono text-3xl tabular-nums text-amber-400 shadow-lg">
          {formatNo(song.no)}
        </div>

        {/* Song info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-2xl font-bold text-neutral-100">
            {song.title}
          </h3>
          <p className="mt-1 truncate text-lg text-neutral-400">
            {song.artist}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full border-amber-500/30 bg-neutral-800/80 text-amber-300"
            >
              {song.vibe}
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full border-neutral-700 bg-neutral-800/80 text-neutral-400"
            >
              {song.len}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
