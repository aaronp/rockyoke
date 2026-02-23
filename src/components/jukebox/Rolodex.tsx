import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Song } from "@/types/jukebox";

type InternalSong = {
  no: number;
  title: string;
  artist: string;
  year: number;
};

const SONGS: InternalSong[] = [
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
];

function toSong(internal: InternalSong): Song {
  return {
    id: String(internal.no),
    number: String(internal.no),
    title: internal.title,
    artist: internal.artist,
    year: internal.year,
  };
}

function getPages(songs: InternalSong[]): { top: InternalSong[]; bottom: InternalSong[] }[] {
  const pages: { top: InternalSong[]; bottom: InternalSong[] }[] = [];
  for (let i = 0; i < songs.length; i += 6) {
    pages.push({
      top: songs.slice(i, i + 3),
      bottom: songs.slice(i + 3, i + 6),
    });
  }
  return pages;
}

function useClackSfx() {
  const ctxRef = useRef<AudioContext | null>(null);

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
      try { await ctx.resume(); } catch { /* ignore */ }
    }
    return ctx;
  }

  function clack(strength = 0.9) {
    const ctx = getCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime;

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

  return { resumeIfNeeded, clack };
}

type Props = {
  onSelectSong?: (song: Song) => void;
};

export function Rolodex({ onSelectSong }: Props) {
  const pages = getPages(SONGS);
  const [pageIndex, setPageIndex] = useState(0);
  const sfx = useClackSfx();

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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); goDown(); }
      else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); goUp(); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goDown, goUp]);

  const currentPage = pages[pageIndex];

  const handleSongClick = useCallback((internal: InternalSong) => {
    if (onSelectSong) {
      onSelectSong(toSong(internal));
    }
  }, [onSelectSong]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Split-flap display */}
      <div className="flex-1" style={{ perspective: "1200px" }}>
        <SplitFlapPanel page={currentPage} onSongClick={handleSongClick} />
      </div>

      {/* Navigation arrows */}
      <div className="flex justify-center gap-2 mt-2">
        <Button
          size="sm"
          className="h-8 rounded-lg bg-amber-600/80 px-3 text-amber-950 hover:bg-amber-500 disabled:opacity-40"
          onClick={goUp}
          disabled={!canGoUp}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          className="h-8 rounded-lg bg-amber-600/80 px-3 text-amber-950 hover:bg-amber-500 disabled:opacity-40"
          onClick={goDown}
          disabled={!canGoDown}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SplitFlapPanel({
  page,
  onSongClick
}: {
  page: { top: InternalSong[]; bottom: InternalSong[] };
  onSongClick: (song: InternalSong) => void;
}) {
  return (
    <div className="relative select-none h-full">
      <div className="relative rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] h-full">
        <div className="bg-gradient-to-b from-amber-100 to-amber-50 h-[calc(50%-2px)]">
          <SongStrips songs={page.top} onSongClick={onSongClick} />
        </div>
        <div className="h-1 bg-gradient-to-b from-amber-800/60 via-amber-900/80 to-amber-800/60" />
        <div className="bg-gradient-to-b from-amber-50 to-amber-100 h-[calc(50%-2px)]">
          <SongStrips songs={page.bottom} onSongClick={onSongClick} />
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={page.top[0]?.no ?? "empty"} className="absolute inset-0">
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
              <SongStrips songs={page.top} onSongClick={onSongClick} />
            </div>
          </motion.div>

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
              <SongStrips songs={page.bottom} onSongClick={onSongClick} />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SongStrips({
  songs,
  onSongClick
}: {
  songs: InternalSong[];
  onSongClick: (song: InternalSong) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-px bg-amber-300/50 p-1.5 h-full">
      {songs.map((song) => (
        <SongCard key={song.no} song={song} onClick={() => onSongClick(song)} />
      ))}
      {songs.length < 3 &&
        Array.from({ length: 3 - songs.length }).map((_, i) => (
          <div key={`empty-${i}`} className="rounded bg-amber-100/50" />
        ))}
    </div>
  );
}

function SongCard({
  song,
  onClick
}: {
  song: InternalSong;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative overflow-hidden rounded bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_3px_rgba(0,0,0,0.2)] flex flex-col text-left cursor-pointer hover:from-amber-100 hover:via-amber-150 hover:to-amber-100 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.25)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
    >
      <div className="border-b border-amber-200/80 px-1.5 py-0.5 flex-1">
        <div className="flex items-start gap-1">
          <span className="font-mono text-[10px] font-bold text-amber-900">{song.no}</span>
          <span className="flex-1 truncate text-[9px] font-semibold uppercase tracking-tight text-amber-950 leading-tight">
            {song.title}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-amber-200/40 px-1.5 py-0.5">
        <div className="flex h-3 w-4 items-center justify-center">
          <div
            className="h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-red-600"
            style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))" }}
          />
        </div>
        <span className="flex-1 truncate text-[9px] font-bold uppercase text-amber-900">
          {song.artist}
        </span>
      </div>
    </button>
  );
}
