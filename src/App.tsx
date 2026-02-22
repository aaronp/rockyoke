import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Disc3,
  Music2,
  Ticket,
  Users,
  Volume2,
  X,
  Plus,
  Minus,
  Coins,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";

// Rockyoke — Jukebox-style signup demo
// Layout:
//  - Single jukebox body (no right-hand column)
//  - Top "records" bay
//  - Middle analog flipbook song browser
//  - Bottom keypad + performers + Tonight's lineup in the main body
//  - Coin-in + clunk SFX (synth, no assets) + glass reflection

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
  { no: 21, title: "Free Fallin'", artist: "Tom Petty", len: "4:16", vibe: "Chill" },
  { no: 22, title: "Use Somebody", artist: "Kings of Leon", len: "3:51", vibe: "Anthem" },
  { no: 23, title: "Shut Up and Dance", artist: "WALK THE MOON", len: "3:19", vibe: "Bounce" },
  { no: 24, title: "Zombie", artist: "The Cranberries", len: "5:06", vibe: "Raw" },
  { no: 25, title: "I Will Survive", artist: "Gloria Gaynor", len: "3:17", vibe: "Iconic" },
  { no: 26, title: "Sweet Child O' Mine", artist: "Guns N' Roses", len: "5:56", vibe: "Guitar" },
  { no: 27, title: "Creep", artist: "Radiohead", len: "3:58", vibe: "Feels" },
  { no: 28, title: "9 to 5", artist: "Dolly Parton", len: "2:43", vibe: "Joy" },
  { no: 29, title: "Dancing Queen", artist: "ABBA", len: "3:50", vibe: "Classic" },
  { no: 30, title: "Sex on Fire", artist: "Kings of Leon", len: "3:24", vibe: "Rock" },
] as const;

type Song = (typeof SONGS)[number];

type QueueItem = {
  id: string;
  names: string[];
  songNo: number;
  createdAt: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatNo(n: number) {
  return String(n).padStart(2, "0");
}

function joinNames(names: string[]) {
  const cleaned = names.map((n) => n.trim()).filter(Boolean);
  if (cleaned.length === 0) return "—";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} & ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")} & ${cleaned[cleaned.length - 1]}`;
}

function useSfx() {
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
      try {
        await ctx.resume();
      } catch {
        // ignore
      }
    }
    return ctx;
  }

  function coin() {
    const ctx = getCtx();
    if (!ctx) return;

    const t0 = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const hp = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1250, t0);
    osc.frequency.exponentialRampToValueAtTime(820, t0 + 0.09);

    hp.type = "highpass";
    hp.frequency.setValueAtTime(650, t0);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);

    osc.connect(hp);
    hp.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 0.16);

    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.25;
    noise.buffer = buf;

    const ng = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(2200, t0);
    bp.Q.setValueAtTime(6, t0);

    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.06, t0 + 0.005);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);

    noise.connect(bp);
    bp.connect(ng);
    ng.connect(ctx.destination);

    noise.start(t0 + 0.03);
    noise.stop(t0 + 0.09);
  }

  function clunk() {
    const ctx = getCtx();
    if (!ctx) return;

    const t0 = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lp = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t0);
    osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.14);

    lp.type = "lowpass";
    lp.frequency.setValueAtTime(280, t0);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + 0.25);

    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
    noise.buffer = buf;

    const ng = ctx.createGain();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(1200, t0);

    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.18, t0 + 0.004);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);

    noise.connect(hp);
    hp.connect(ng);
    ng.connect(ctx.destination);

    noise.start(t0 + 0.01);
    noise.stop(t0 + 0.08);
  }

  return { resumeIfNeeded, coin, clunk };
}

function GlassReflection() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rotate-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent blur-2xl" />
      <div className="absolute -right-1/4 -top-1/3 h-1/3 w-1/3 -rotate-12 bg-gradient-to-bl from-white/8 via-transparent to-transparent blur-xl" />
    </div>
  );
}

export default function App() {
  const songs = SONGS;
  const byNo = useMemo(() => new Map<number, Song>(songs.map((s) => [s.no, s])), [songs]);
  const sfx = useSfx();

  const [digits, setDigits] = useState("12");
  const [names, setNames] = useState<string[]>([""]); // up to 4
  const [queue, setQueue] = useState<QueueItem[]>(() => [
    { id: "seed-1", names: ["Sam"], songNo: 12, createdAt: Date.now() - 1000 * 60 * 21 },
    { id: "seed-2", names: ["Priya", "Alex"], songNo: 19, createdAt: Date.now() - 1000 * 60 * 14 },
    { id: "seed-3", names: ["Jamie"], songNo: 16, createdAt: Date.now() - 1000 * 60 * 8 },
  ]);

  const [filter, setFilter] = useState("");
  const filteredSongs = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) => `${s.no} ${s.title} ${s.artist} ${s.vibe}`.toLowerCase().includes(q));
  }, [filter, songs]);

  const [flipIndex, setFlipIndex] = useState(0);
  useEffect(() => {
    setFlipIndex((i) => clamp(i, 0, Math.max(0, filteredSongs.length - 1)));
  }, [filteredSongs.length]);

  const [nowPlaying, setNowPlaying] = useState<QueueItem | null>(null);
  const [playingProgress, setPlayingProgress] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [toast, setToast] = useState<{ title: string; body?: string } | null>(null);

  const selectedNo = digits.length ? Number(digits) : NaN;
  const selectedSong = Number.isFinite(selectedNo) ? byNo.get(selectedNo) : undefined;

  // When flipIndex changes, set digits to that song number.
  useEffect(() => {
    const s = filteredSongs[flipIndex];
    if (!s) return;
    setDigits(String(s.no));
  }, [flipIndex, filteredSongs]);

  // Fake playback ticker when "playing"
  useEffect(() => {
    if (!spinning) return;
    const t = setInterval(() => {
      setPlayingProgress((p) => (p + 0.9 >= 100 ? 100 : p + 0.9));
    }, 80);
    return () => clearInterval(t);
  }, [spinning]);

  // Stop at 100%
  useEffect(() => {
    if (!spinning) return;
    if (playingProgress < 100) return;
    const timeout = setTimeout(() => {
      setSpinning(false);
      setToast({ title: "Queue confirmed", body: "You're booked — see you on stage" });
      setTimeout(() => setToast(null), 2400);
    }, 450);
    return () => clearTimeout(timeout);
  }, [spinning, playingProgress]);

  const cleanedNames = useMemo(() => names.map((n) => n.trim()).filter(Boolean), [names]);
  const canAdd = cleanedNames.length > 0 && Boolean(selectedSong);

  async function pressKey(k: string) {
    await sfx.resumeIfNeeded();

    if (k === "C") {
      sfx.clunk();
      setDigits("");
      return;
    }
    if (k === "←") {
      sfx.clunk();
      setDigits((d) => d.slice(0, -1));
      return;
    }
    if (k === "#") {
      sfx.coin();
      const pick = songs[Math.floor(Math.random() * songs.length)].no;
      setDigits(String(pick));
      return;
    }
    if (!/^[0-9]$/.test(k)) return;

    sfx.clunk();
    setDigits((d) => (d + k).slice(0, 2));
  }

  async function coinInAndLock() {
    if (!canAdd || !selectedSong) return;
    await sfx.resumeIfNeeded();

    sfx.coin();
    setTimeout(() => sfx.clunk(), 70);

    const item: QueueItem = {
      id: crypto?.randomUUID?.() ?? String(Date.now()) + Math.random().toString(16).slice(2),
      names: cleanedNames.slice(0, 4),
      songNo: selectedSong.no,
      createdAt: Date.now(),
    };

    setQueue((q) => [item, ...q]);
    setNowPlaying(item);
    setPlayingProgress(0);
    setSpinning(true);
  }

  function removeFromQueue(id: string) {
    setQueue((q) => q.filter((x) => x.id !== id));
  }

  const playingSong = nowPlaying ? byNo.get(nowPlaying.songNo) : undefined;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Header />

        <div className="mt-6">
          <JukeboxShell>
            <div className="grid gap-4">
              <RecordsBay selectedSong={selectedSong} spinning={spinning} progress={playingProgress} />

              <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <FlipbookBrowser
                  songs={filteredSongs}
                  index={flipIndex}
                  setIndex={async (i) => {
                    await sfx.resumeIfNeeded();
                    sfx.clunk();
                    setFlipIndex(i);
                  }}
                  filter={filter}
                  setFilter={setFilter}
                />

                <KeypadAndPerformers
                  digits={digits}
                  selectedSong={selectedSong}
                  names={names}
                  setNames={setNames}
                  onKey={pressKey}
                  onLock={coinInAndLock}
                  canAdd={canAdd}
                  disabled={spinning}
                />
              </div>

              <LineupPanel queue={queue} byNo={byNo} onRemove={removeFromQueue} />

              <NowPlayingStrip song={playingSong} spinning={spinning} />
            </div>
          </JukeboxShell>
        </div>

        <FooterHint />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-5 left-1/2 z-50 w-[min(520px,calc(100%-2rem))] -translate-x-1/2"
          >
            <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/80 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-100">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-neutral-100">{toast.title}</div>
                  {toast.body && <div className="mt-0.5 text-sm text-neutral-200">{toast.body}</div>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto -mr-1 text-neutral-100 hover:bg-neutral-900/60"
                  onClick={() => setToast(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-amber-500/25 via-fuchsia-500/15 to-cyan-500/20 blur-xl" />
            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
              <Disc3 className="h-6 w-6 text-neutral-100" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-neutral-100">Rockyoke</div>
            <div className="text-sm text-neutral-200">A jukebox signup: browse the cards, punch the number, coin-in to lock.</div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Badge variant="secondary" className="gap-1.5 rounded-full border-neutral-800 bg-neutral-900/70 text-neutral-100">
            <Users className="h-3.5 w-3.5" />
            Live band
          </Badge>
          <Badge variant="secondary" className="gap-1.5 rounded-full border-neutral-800 bg-neutral-900/70 text-neutral-100">
            <Volume2 className="h-3.5 w-3.5" />
            Loud joy
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-200">
          <span className="rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-neutral-100">1)</span>
          Flip through songs
          <span className="text-neutral-600">•</span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-neutral-100">2)</span>
          Punch the 2-digit number
          <span className="text-neutral-600">•</span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-neutral-100">3)</span>
          Add up to 4 performers
          <span className="text-neutral-600">•</span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-neutral-100">4)</span>
          Coin-in & lock
        </div>
      </div>
    </div>
  );
}

function JukeboxShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* wood sides */}
      <div className="pointer-events-none absolute inset-y-0 -left-3 w-8 rounded-[40px] bg-gradient-to-b from-[#6b3f1f] via-[#8a552b] to-[#5c351b] opacity-90 blur-[0.2px]" />
      <div className="pointer-events-none absolute inset-y-0 -right-3 w-8 rounded-[40px] bg-gradient-to-b from-[#6b3f1f] via-[#8a552b] to-[#5c351b] opacity-90 blur-[0.2px]" />

      {/* chrome ribs */}
      <div className="pointer-events-none absolute left-2 right-2 top-12 hidden h-1 rounded-full bg-white/10 lg:block" />
      <div className="pointer-events-none absolute left-2 right-2 top-16 hidden h-1 rounded-full bg-white/6 lg:block" />
      <div className="pointer-events-none absolute left-2 right-2 top-20 hidden h-1 rounded-full bg-white/10 lg:block" />

      <Card className="relative overflow-hidden rounded-[44px] border-neutral-800 bg-neutral-950 shadow-[0_40px_120px_rgba(0,0,0,0.75)]">
        <CardContent className="relative p-4 sm:p-5">
          <GlassReflection />
          <div className="relative rounded-[34px] border border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-950/80 p-4 sm:p-5">
            <div className="pointer-events-none absolute inset-0 rounded-[34px] ring-1 ring-white/5" />
            <div className="relative">{children}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecordsBay(props: { selectedSong?: Song; spinning: boolean; progress: number }) {
  const { selectedSong, spinning, progress } = props;

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-neutral-800 bg-neutral-950/70 p-4">
      <GlassReflection />

      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              className="relative h-28 w-28 rounded-full border border-neutral-800 bg-neutral-950 shadow-[0_25px_80px_rgba(0,0,0,0.85)]"
              animate={spinning ? { rotate: 360 } : { rotate: 0 }}
              transition={spinning ? { repeat: Infinity, ease: "linear", duration: 1.35 } : { duration: 0.25 }}
            >
              <div className="absolute inset-3 rounded-full border border-neutral-800/60" />
              <div className="absolute inset-7 rounded-full border border-neutral-800/45" />
              <div className="absolute inset-11 rounded-full border border-neutral-800/35" />
              <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-gradient-to-br from-amber-500/25 via-fuchsia-500/20 to-cyan-500/25" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950" />
              <div className="absolute -left-3 top-7 h-14 w-14 rounded-full bg-white/10 blur-xl" />
            </motion.div>

            <motion.div
              className="absolute -right-4 top-3 h-20 w-20 origin-top-left"
              animate={spinning ? { rotate: 18 } : { rotate: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute left-1 top-0 h-16 w-2 rounded-full bg-neutral-800" />
              <div className="absolute left-0 top-13 h-7 w-7 rounded-2xl border border-neutral-700 bg-neutral-900" />
            </motion.div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-neutral-300">RECORDS</div>
              <Badge variant="secondary" className="rounded-full border-neutral-800 bg-neutral-900/60 text-neutral-100">
                {spinning ? "playing" : "ready"}
              </Badge>
            </div>
            <div className="mt-1 text-base font-semibold text-neutral-100">{selectedSong ? selectedSong.title : "Browse below"}</div>
            <div className="text-sm text-neutral-300">
              {selectedSong ? selectedSong.artist : "Flip through the song cards to choose"}
            </div>

            <div className="mt-3">
              <div className="h-2 w-[min(520px,100%)] overflow-hidden rounded-full border border-neutral-800 bg-neutral-950">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500/80 via-fuchsia-500/70 to-cyan-500/70"
                  style={{ width: `${clamp(progress, 0, 100)}%` }}
                  animate={spinning ? { opacity: 1 } : { opacity: 0.6 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <div className="mt-1 flex w-[min(520px,100%)] items-center justify-between text-xs text-neutral-500">
                <span>preview</span>
                <span className="tabular-nums">{Math.round(clamp(progress, 0, 100))}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-5 gap-3 lg:justify-end">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60">
              <div className="absolute inset-0 bg-gradient-to-br from-white/6 via-transparent to-white/4" />
              <div className="relative p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950">
                  <Disc3 className="h-5 w-5 text-neutral-100" />
                </div>
                <div className="mt-2 h-1.5 w-10 rounded-full bg-white/10" />
                <div className="mt-1 h-1.5 w-14 rounded-full bg-white/7" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlipbookBrowser(props: {
  songs: readonly Song[];
  index: number;
  setIndex: (i: number) => void | Promise<void>;
  filter: string;
  setFilter: (v: string) => void;
}) {
  const { songs, index, setIndex, filter, setFilter } = props;
  const max = Math.max(0, songs.length - 1);

  function go(delta: number) {
    const next = clamp(index + delta, 0, max);
    if (next === index) return;
    setIndex(next);
  }

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-neutral-800 bg-neutral-950/70 p-4">
      <GlassReflection />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Music2 className="h-4 w-4" />
            <div className="text-sm font-semibold text-neutral-100">Song cards</div>
            <Badge variant="secondary" className="rounded-full border-neutral-800 bg-neutral-900/60 text-neutral-100">
              {songs.length}
            </Badge>
          </div>
          <div className="mt-1 text-sm text-neutral-300">Analog flipbook browsing — scroll or use the arrows.</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search songs"
              className="h-10 w-[180px] rounded-2xl border-neutral-800 bg-neutral-950 pl-9 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <Button
            variant="secondary"
            className="h-10 rounded-2xl border border-neutral-800 bg-neutral-900/60 text-neutral-100 hover:bg-neutral-900"
            onClick={() => go(-1)}
            disabled={index <= 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            className="h-10 rounded-2xl border border-neutral-800 bg-neutral-900/60 text-neutral-100 hover:bg-neutral-900"
            onClick={() => go(1)}
            disabled={index >= max}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-4 bg-neutral-800" />

      <div
        className="relative"
        onWheel={(e) => {
          if (Math.abs(e.deltaY) < 4) return;
          go(e.deltaY > 0 ? 1 : -1);
        }}
      >
        <div className="relative overflow-hidden rounded-[26px] border border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-950/70 p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),rgba(0,0,0,0)_40%)]" />

          <div className="pointer-events-none absolute inset-y-3 left-3 w-1 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute inset-y-3 right-3 w-1 rounded-full bg-white/10" />

          <div className="relative h-[260px]">
            {Array.from({ length: 6 }).map((_, layer) => {
              const idx = clamp(index + (layer - 1), 0, max);
              const s = songs[idx];
              const isActive = layer === 2;
              const y = (layer - 2) * 18;
              const scale = 1 - Math.abs(layer - 2) * 0.035;
              const opacity = clamp(1 - Math.abs(layer - 2) * 0.18, 0.08, 1);

              return (
                <motion.div
                  key={`${layer}-${s?.no ?? "x"}-${idx}`}
                  className="absolute left-1/2 top-1/2 w-[min(520px,95%)] -translate-x-1/2"
                  initial={{ opacity: 0, y: y + 10, rotateX: 12 }}
                  animate={{ opacity, y, scale, rotateX: isActive ? 0 : 10 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "center" }}
                >
                  <div
                    className={
                      "relative overflow-hidden rounded-[22px] border shadow-[0_18px_70px_rgba(0,0,0,0.65)] " +
                      (isActive
                        ? "border-amber-500/60 bg-gradient-to-r from-amber-500/10 via-fuchsia-500/8 to-cyan-500/8"
                        : "border-neutral-800 bg-neutral-950/70")
                    }
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:10px_10px]" />

                    <div className="relative p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "flex h-11 w-11 items-center justify-center rounded-xl border font-mono text-base tabular-nums " +
                              (isActive
                                ? "border-amber-500/50 bg-neutral-950 text-neutral-100"
                                : "border-neutral-800 bg-neutral-950/70 text-neutral-200")
                            }
                          >
                            {s ? formatNo(s.no) : "—"}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold text-neutral-100">{s?.title ?? "No songs"}</div>
                            <div className="truncate text-sm text-neutral-300">{s?.artist ?? "Try clearing the filter"}</div>
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end">
                          <div className="text-xs text-neutral-400">{s?.len ?? ""}</div>
                          <Badge
                            variant="secondary"
                            className={
                              "mt-1 rounded-full border-neutral-800 bg-neutral-900/60 text-neutral-100 " +
                              (isActive ? "border-amber-500/30" : "")
                            }
                          >
                            {s?.vibe ?? ""}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
                        <div className="h-1.5 w-full rounded-full bg-white/8" />
                        <div className="text-xs text-neutral-500 tabular-nums">
                          {songs.length === 0 ? "0/0" : `${idx + 1}/${songs.length}`}
                        </div>
                      </div>

                      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white/10 via-white/5 to-transparent" />
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-neutral-950 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-neutral-950 to-transparent" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          <div>Tip: scroll to flip • arrows for precision</div>
          <div className="tabular-nums">Selected card: {songs[index] ? formatNo(songs[index].no) : "—"}</div>
        </div>
      </div>
    </div>
  );
}

function KeypadAndPerformers(props: {
  digits: string;
  selectedSong?: Song;
  names: string[];
  setNames: React.Dispatch<React.SetStateAction<string[]>>;
  onKey: (k: string) => void | Promise<void>;
  onLock: () => void | Promise<void>;
  canAdd: boolean;
  disabled?: boolean;
}) {
  const { digits, selectedSong, names, setNames, onKey, onLock, canAdd, disabled } = props;
  const performerCount = names.length;

  function setNameAt(i: number, v: string) {
    setNames((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  }

  function addPerformer() {
    setNames((arr) => (arr.length >= 4 ? arr : [...arr, ""]));
  }

  function removePerformer() {
    setNames((arr) => (arr.length <= 1 ? arr : arr.slice(0, -1)));
  }

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-neutral-800 bg-neutral-950/70 p-4">
      <GlassReflection />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-neutral-300">PUNCH IN THE SONG #</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-2xl tracking-widest tabular-nums text-neutral-100">
                {digits.padEnd(2, "•")}
              </div>
              <Button
                variant="secondary"
                className="h-11 rounded-2xl border border-neutral-800 bg-neutral-900/70 text-neutral-100 hover:bg-neutral-900"
                onClick={() => onKey("#")}
                title="Random pick"
                disabled={disabled}
              >
                Surprise
              </Button>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <div className="text-xs text-neutral-300">Selected</div>
            <div className="mt-1 text-sm font-semibold text-neutral-100">{selectedSong ? selectedSong.title : "—"}</div>
            <div className="text-xs text-neutral-400">{selectedSong ? selectedSong.artist : ""}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "C",
            "0",
            "←",
          ].map((k) => (
            <Button
              key={k}
              variant="secondary"
              className={
                "h-11 rounded-2xl border border-neutral-800 bg-neutral-900/60 font-mono text-base tracking-widest text-neutral-100 hover:bg-neutral-900 " +
                (k === "C" ? "hover:bg-amber-500/10" : "")
              }
              onClick={() => onKey(k)}
              disabled={disabled}
            >
              {k}
            </Button>
          ))}
        </div>

        <Separator className="my-4 bg-neutral-800" />

        <div className="grid gap-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-neutral-300">PERFORMERS (UP TO 4)</div>
              <div className="mt-0.5 text-xs text-neutral-500">Solo, duo, or group — we'll call you up together.</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="h-9 rounded-2xl border border-neutral-800 bg-neutral-900/60 text-neutral-100 hover:bg-neutral-900"
                onClick={removePerformer}
                disabled={performerCount <= 1 || disabled}
                title="Remove performer"
              >
                <Minus className="mr-2 h-4 w-4" />
                Remove
              </Button>
              <Button
                variant="secondary"
                className="h-9 rounded-2xl border border-neutral-800 bg-neutral-900/60 text-neutral-100 hover:bg-neutral-900"
                onClick={addPerformer}
                disabled={performerCount >= 4 || disabled}
                title="Add performer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            {names.map((n, i) => (
              <Input
                key={i}
                value={n}
                onChange={(e) => setNameAt(i, e.target.value)}
                placeholder={i === 0 ? "e.g., Aaron" : `Performer ${i + 1}`}
                className="h-11 rounded-2xl border-neutral-800 bg-neutral-950 text-neutral-100 placeholder:text-neutral-500"
                disabled={disabled}
              />
            ))}
          </div>

          <Button
            onClick={onLock}
            disabled={!canAdd || disabled}
            className="h-11 rounded-2xl bg-gradient-to-r from-amber-500/90 via-fuchsia-500/85 to-cyan-500/85 text-neutral-950 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            <Coins className="mr-2 h-4 w-4" />
            Coin in & lock it
          </Button>

          <div className="text-xs text-neutral-500">Audio unlocks on first interaction (browser rule). Headphones recommended.</div>
        </div>
      </div>
    </div>
  );
}

function LineupPanel(props: {
  queue: QueueItem[];
  byNo: Map<number, Song>;
  onRemove: (id: string) => void;
}) {
  const { queue, byNo, onRemove } = props;

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-neutral-800 bg-neutral-950/70">
      <GlassReflection />

      <div className="relative px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <div className="text-sm font-semibold text-neutral-100">Tonight's lineup</div>
          </div>
          <Badge variant="secondary" className="rounded-full border-neutral-800 bg-neutral-900/60 text-neutral-100">
            {queue.length}
          </Badge>
        </div>
        <div className="mt-1 text-sm text-neutral-300">Everyone can see this list (demo: remove buttons shown).</div>
      </div>

      <Separator className="bg-neutral-800" />

      <ScrollArea className="relative h-[250px]">
        <div className="p-3">
          <AnimatePresence initial={false}>
            {queue.map((q) => {
              const song = byNo.get(q.songNo);
              return (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.99 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2"
                >
                  <div className="group rounded-2xl border border-neutral-800 bg-neutral-950/70 p-3 hover:bg-neutral-900/30">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-base tabular-nums text-neutral-100">
                        {formatNo(q.songNo)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-semibold text-neutral-100">{joinNames(q.names)}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl text-neutral-100 opacity-0 transition group-hover:opacity-100 hover:bg-neutral-900/60"
                            onClick={() => onRemove(q.id)}
                            title="Remove (demo)"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-0.5 truncate text-sm text-neutral-200">
                          {song ? (
                            <>
                              <span className="font-medium text-neutral-100">{song.title}</span>
                              <span className="text-neutral-400"> — {song.artist}</span>
                            </>
                          ) : (
                            <span className="text-neutral-500">Unknown song</span>
                          )}
                        </div>
                        {song?.vibe && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="rounded-full border-neutral-800 bg-neutral-900/60 text-neutral-100">
                              {song.vibe}
                            </Badge>
                            <Badge variant="secondary" className="rounded-full border-neutral-800 bg-neutral-900/60 text-neutral-100">
                              {song.len}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {queue.length === 0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-300">
              No signups yet — be the first to coin in.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function NowPlayingStrip(props: { song?: Song; spinning: boolean }) {
  const { song, spinning } = props;

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-neutral-800 bg-neutral-950/70">
      <GlassReflection />
      <div className="relative flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-800 bg-neutral-950">
          <motion.div
            animate={spinning ? { rotate: 360 } : { rotate: 0 }}
            transition={spinning ? { repeat: Infinity, ease: "linear", duration: 1.5 } : { duration: 0.2 }}
          >
            <Disc3 className="h-4 w-4 text-neutral-100" />
          </motion.div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-neutral-400">Now playing</div>
          <div className="truncate text-sm font-medium text-neutral-100">
            {song ? `${song.title} — ${song.artist}` : "Nothing yet"}
          </div>
        </div>
        {spinning && (
          <Badge variant="secondary" className="rounded-full border-amber-500/30 bg-amber-500/10 text-amber-400">
            Live
          </Badge>
        )}
      </div>
    </div>
  );
}

function FooterHint() {
  return (
    <div className="mt-6 text-center text-xs text-neutral-500">
      Rockyoke — Built with React + Vite + Tailwind. Sound effects synthesized in-browser.
    </div>
  );
}
