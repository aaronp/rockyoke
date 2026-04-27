import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Song } from "@/types/jukebox";
import { SONGS, songCode, SONG_BY_CODE } from "@/data/songs";
import type { InternalSong, PageEntry } from "@/data/songs";

type Page = { top: PageEntry[]; bottom: PageEntry[] };

function getPages(songs: InternalSong[], songsPerRow: number = 3): Page[] {
  const perPage = songsPerRow * 2;
  const pages: Page[] = [];
  for (let i = 0; i < songs.length; i += perPage) {
    pages.push({
      top: songs.slice(i, i + songsPerRow).map((song, j) => ({ song, absoluteIndex: i + j })),
      bottom: songs.slice(i + songsPerRow, i + perPage).map((song, j) => ({ song, absoluteIndex: i + songsPerRow + j })),
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
  pageIndex?: number;           // Controlled page index
  onPageChange?: (index: number) => void;  // Callback when page changes
  variant?: "large" | "small";  // Size variant for responsive layouts
};

export function Rolodex({ onSelectSong, pageIndex: controlledPageIndex, onPageChange, variant = "large" }: Props) {
  const songsPerRow = variant === "small" ? 2 : 3;
  const pages = getPages(SONGS, songsPerRow);
  const [internalPageIndex, setInternalPageIndex] = useState(0);

  // Use controlled if provided, otherwise internal
  const pageIndex = controlledPageIndex ?? internalPageIndex;
  const setPageIndex = onPageChange ?? setInternalPageIndex;

  const sfx = useClackSfx();

  const canGoDown = pageIndex < pages.length - 1;
  const canGoUp = pageIndex > 0;

  const goDown = useCallback(async () => {
    if (!canGoDown) return;
    await sfx.resumeIfNeeded();
    sfx.clack(0.95);
    setPageIndex(pageIndex + 1);
  }, [canGoDown, sfx, pageIndex, setPageIndex]);

  const goUp = useCallback(async () => {
    if (!canGoUp) return;
    await sfx.resumeIfNeeded();
    sfx.clack(0.85);
    setPageIndex(pageIndex - 1);
  }, [canGoUp, sfx, pageIndex, setPageIndex]);

  // Only handle keyboard navigation in uncontrolled mode
  // When controlled (onPageChange provided), let the parent handle keyboard events
  useEffect(() => {
    if (onPageChange) return; // Skip keyboard handling in controlled mode

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); goDown(); }
      else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); goUp(); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goDown, goUp, onPageChange]);

  const currentPage = pages[pageIndex];

  const handleSongClick = useCallback((entry: PageEntry) => {
    if (onSelectSong) {
      onSelectSong(SONG_BY_CODE[songCode(entry.absoluteIndex)]);
    }
  }, [onSelectSong]);

  return (
    <div className="w-full h-full" style={{ perspective: "1200px" }}>
      <SplitFlapPanel page={currentPage} onSongClick={handleSongClick} variant={variant} />
    </div>
  );
}

function SplitFlapPanel({
  page,
  onSongClick,
  variant = "large"
}: {
  page: Page;
  onSongClick: (entry: PageEntry) => void;
  variant?: "large" | "small";
}) {
  return (
    <div className="relative select-none h-full">
      <div className="relative rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] h-full">
        <div className="bg-gradient-to-b from-amber-100 to-amber-50 h-[calc(50%-2px)]">
          <SongStrips songs={page.top} onSongClick={onSongClick} variant={variant} />
        </div>
        <div className="h-1 bg-gradient-to-b from-amber-800/60 via-amber-900/80 to-amber-800/60" />
        <div className="bg-gradient-to-b from-amber-50 to-amber-100 h-[calc(50%-2px)]">
          <SongStrips songs={page.bottom} onSongClick={onSongClick} variant={variant} />
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={page.top[0]?.song.no ?? "empty"} className="absolute inset-0 pointer-events-none">
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
              <SongStrips songs={page.top} onSongClick={onSongClick} variant={variant} />
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-xl pointer-events-auto"
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
              <SongStrips songs={page.bottom} onSongClick={onSongClick} variant={variant} />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SongStrips({
  songs,
  onSongClick,
  variant = "large"
}: {
  songs: PageEntry[];
  onSongClick: (entry: PageEntry) => void;
  variant?: "large" | "small";
}) {
  const isSmall = variant === "small";
  const cols = isSmall ? 2 : 3;

  const gridCols = isSmall ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";
  const padding = isSmall ? "p-0.5" : "p-0.5 sm:p-1";

  return (
    <div className={`grid ${gridCols} gap-px sm:gap-0.5 bg-amber-300/50 ${padding} h-full`}>
      {songs.map((entry, i) => {
        const displayNumber = songCode(entry.absoluteIndex);
        const isThirdInRow = i === 2;
        // Large variant: hide 3rd on mobile, show on desktop
        // Small variant: only 2 per row, so i===2 never occurs
        const hideClass = isThirdInRow ? "hidden sm:block" : "";
        return (
          <div key={entry.song.no} className={`h-full ${hideClass}`}>
            <SongCard
              song={entry.song}
              displayNumber={displayNumber}
              onClick={() => onSongClick(entry)}
              variant={variant}
            />
          </div>
        );
      })}
      {songs.length < cols &&
        Array.from({ length: cols - songs.length }).map((_, i) => (
          <div key={`empty-${i}`} className={`rounded bg-amber-100/50 ${isSmall ? "" : "hidden sm:block"}`} />
        ))}
    </div>
  );
}

function SongCard({
  song,
  displayNumber,
  onClick,
  variant = "large"
}: {
  song: InternalSong;
  displayNumber: string;
  onClick: () => void;
  variant?: "large" | "small";
}) {
  const isSmall = variant === "small";
  const isRequest = song.isRequest;

  // Small variant uses larger text sizes than the default mobile breakpoint
  const codeSize = isSmall ? "text-[10px]" : "text-[7px] sm:text-[14px]";
  const titleSize = isSmall ? "text-[8px]" : "text-[6px] sm:text-[12px]";
  const artistSize = isSmall ? "text-[9px]" : "text-[6px] sm:text-[13px]";
  const padding = isSmall ? "px-1" : "px-0.5 sm:px-2";
  const gap = isSmall ? "gap-0.5" : "gap-0.5 sm:gap-1.5";
  const playIconSize = isSmall ? "h-3 w-4" : "h-2 sm:h-4 w-3 sm:w-5";
  const playTriangle = isSmall ? "border-y-[4px] border-l-[6px]" : "border-y-[3px] sm:border-y-[5px] border-l-[4px] sm:border-l-[8px]";

  // Request song has red background styling
  const bgClasses = isRequest
    ? "bg-gradient-to-b from-rose-400 via-rose-500 to-rose-400 hover:from-rose-500 hover:via-rose-600 hover:to-rose-500"
    : "bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 hover:from-amber-100 hover:via-amber-150 hover:to-amber-100";
  const textColor = isRequest ? "text-white" : "text-amber-950";
  const codeColor = isRequest ? "text-rose-100" : "text-amber-900";
  const artistColor = isRequest ? "text-rose-100" : "text-amber-900";
  const borderColor = isRequest ? "border-rose-300/50" : "border-amber-200/80";
  const bottomBg = isRequest ? "bg-rose-600/40" : "bg-amber-200/40";
  const ringColor = isRequest ? "focus:ring-rose-500" : "focus:ring-amber-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded ${bgClasses} shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_3px_rgba(0,0,0,0.2)] flex flex-col text-left cursor-pointer hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.25)] transition-all duration-150 focus:outline-none focus:ring-2 ${ringColor} focus:ring-offset-1 h-full w-full`}
    >
      <div className={`${borderColor} border-b ${padding} py-0.5 flex-1`}>
        <div className={`flex items-start ${gap}`}>
          <span className={`font-mono ${codeSize} font-bold ${codeColor}`}>{displayNumber}</span>
          <span className={`flex-1 truncate ${titleSize} font-semibold uppercase tracking-tight ${textColor} leading-tight`}>
            {song.title}
          </span>
        </div>
      </div>
      <div className={`flex items-center ${gap} ${bottomBg} ${padding} py-0.5`}>
        <div className={`flex ${playIconSize} items-center justify-center`}>
          <div
            className={`h-0 w-0 ${playTriangle} border-y-transparent ${isRequest ? "border-l-white" : "border-l-red-600"}`}
            style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))" }}
          />
        </div>
        <span className={`flex-1 truncate ${artistSize} font-bold uppercase ${artistColor}`}>
          {song.artist}
        </span>
      </div>
    </button>
  );
}
