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
  { no: 1, title: "Hard To Handle", artist: "The Black Crowes", year: 1990 },
  { no: 2, title: "In The Morning", artist: "Razorlight", year: 2006 },
  { no: 3, title: "Dakota", artist: "Stereophonics", year: 2005 },
  { no: 4, title: "No One Knows", artist: "Queens of the Stone Age", year: 2002 },
  { no: 5, title: "Hush", artist: "Kula Shaker", year: 1997 },
  { no: 6, title: "The Riverboat Song", artist: "Ocean Colour Scene", year: 1996 },
  { no: 7, title: "Mustang Sally", artist: "The Commitments", year: 1991 },
  { no: 8, title: "Take Me Home, Country Roads", artist: "John Denver", year: 1971 },
  { no: 9, title: "Alright", artist: "Supergrass", year: 1995 },
  { no: 10, title: "Are You Gonna Be My Girl", artist: "Jet", year: 2003 },
  { no: 11, title: "Long Cool Woman (In a Black Dress)", artist: "The Hollies", year: 1972 },
  { no: 12, title: "Heavyweight Champion of the World", artist: "Reverend And The Makers", year: 2007 },
  { no: 13, title: "My Hero", artist: "Foo Fighters", year: 1997 },
  { no: 14, title: "Zombie", artist: "The Cranberries", year: 1994 },
  { no: 15, title: "Jamming", artist: "Bob Marley & The Wailers", year: 1977 },
  { no: 16, title: "I Don't Like Cricket (I Love It)", artist: "10cc", year: 1979 },
  { no: 17, title: "Seventeen Going Under", artist: "Sam Fender", year: 2021 },
  { no: 18, title: "Master Blaster (Jammin')", artist: "Stevie Wonder", year: 1980 },
  { no: 19, title: "Could You Be Loved", artist: "Bob Marley & The Wailers", year: 1980 },
  { no: 20, title: "You Make My Dreams (Come True)", artist: "Hall & Oates", year: 1980 },
  { no: 21, title: "Morning Glory", artist: "Oasis", year: 1995 },
  { no: 22, title: "Summer Of '69", artist: "Bryan Adams", year: 1984 },
  { no: 23, title: "Gay Bar", artist: "Electric Six", year: 2003 },
  { no: 24, title: "Sweet Child O' Mine", artist: "Guns N' Roses", year: 1987 },
  { no: 25, title: "Fat Bottomed Girls", artist: "Queen", year: 1978 },
  { no: 26, title: "Don't Stop Believin'", artist: "Journey", year: 1981 },
  { no: 27, title: "Tribute", artist: "Tenacious D", year: 2001 },
  { no: 28, title: "All The Small Things", artist: "blink-182", year: 1999 },
  { no: 29, title: "Sir Duke", artist: "Stevie Wonder", year: 1976 },
  { no: 30, title: "Kids", artist: "MGMT", year: 2007 },
  { no: 31, title: "The Chain", artist: "Fleetwood Mac", year: 1977 },
  { no: 32, title: "Dreams", artist: "Fleetwood Mac", year: 1977 },
  { no: 33, title: "Landslide", artist: "Fleetwood Mac", year: 1975 },
  { no: 34, title: "Lovely Day", artist: "Bill Withers", year: 1977 },
  { no: 35, title: "Paradise City", artist: "Guns N' Roses", year: 1987 },
  { no: 36, title: "Tombstone", artist: "Ocean Alley", year: 2018 },
  { no: 37, title: "Two Princes", artist: "Spin Doctors", year: 1991 },
  { no: 38, title: "Don't Look Back In Anger", artist: "Oasis", year: 1996 },
  { no: 39, title: "All Right Now", artist: "Free", year: 1970 },
  { no: 40, title: "I'm Gonna Be (500 Miles)", artist: "The Proclaimers", year: 1988 },
  { no: 41, title: "Valerie", artist: "The Zutons", year: 2006 },
  { no: 42, title: "The Gambler", artist: "Kenny Rogers", year: 1978 },
  { no: 43, title: "Seven Nation Army", artist: "The White Stripes", year: 2003 },
  { no: 44, title: "Dammit", artist: "blink-182", year: 1997 },
  { no: 45, title: "The Middle", artist: "Jimmy Eat World", year: 2001 },
  { no: 46, title: "American Idiot", artist: "Green Day", year: 2004 },
  { no: 47, title: "Everything About You", artist: "Ugly Kid Joe", year: 1991 },
  { no: 48, title: "Figure It Out", artist: "Royal Blood", year: 2014 },
  { no: 49, title: "Black Chandelier", artist: "Biffy Clyro", year: 2013 },
  { no: 50, title: "Holiday", artist: "Green Day", year: 2004 },
  { no: 51, title: "All My Life", artist: "Foo Fighters", year: 2002 },
  { no: 52, title: "Basket Case", artist: "Green Day", year: 1994 },
  { no: 53, title: "Personal Jesus", artist: "Depeche Mode", year: 1989 },
  { no: 54, title: "What's The Frequency, Kenneth?", artist: "R.E.M.", year: 1994 },
  { no: 55, title: "You Really Got Me", artist: "Van Halen", year: 1978 },
  { no: 56, title: "Peaches", artist: "The Presidents Of The USA", year: 1995 },
  { no: 57, title: "My Own Worst Enemy", artist: "Lit", year: 1999 },
  { no: 58, title: "Rock and Roll", artist: "Led Zeppelin", year: 1971 },
  { no: 59, title: "Long Train Runnin'", artist: "The Doobie Brothers", year: 1973 },
  { no: 60, title: "Vertigo", artist: "U2", year: 2004 },
  { no: 61, title: "Plug in Baby", artist: "Muse", year: 2001 },
  { no: 62, title: "Hysteria", artist: "Muse", year: 2003 },
  { no: 63, title: "You're All I Have", artist: "Snow Patrol", year: 2006 },
  { no: 64, title: "Message In A Bottle", artist: "The Police", year: 1979 },
  { no: 65, title: "Sex on Fire", artist: "Kings of Leon", year: 2008 },
  { no: 66, title: "A New Beginning", artist: "Good Charlotte", year: 2000 },
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
    <div className="w-full h-full flex">
      {/* Split-flap display */}
      <div className="flex-1 h-full" style={{ perspective: "1200px" }}>
        <SplitFlapPanel page={currentPage} onSongClick={handleSongClick} />
      </div>

      {/* Navigation arrows - positioned on the right */}
      <div className="flex flex-col justify-center gap-1 pl-2">
        <Button
          size="sm"
          className="h-10 w-10 rounded-full bg-amber-600/90 p-0 text-amber-950 hover:bg-amber-500 disabled:opacity-40 shadow-lg"
          onClick={goUp}
          disabled={!canGoUp}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          className="h-10 w-10 rounded-full bg-amber-600/90 p-0 text-amber-950 hover:bg-amber-500 disabled:opacity-40 shadow-lg"
          onClick={goDown}
          disabled={!canGoDown}
        >
          <ChevronDown className="h-5 w-5" />
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
        <motion.div key={page.top[0]?.no ?? "empty"} className="absolute inset-0 pointer-events-none">
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
