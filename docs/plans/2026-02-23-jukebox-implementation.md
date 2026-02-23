# Jukebox Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a karaoke jukebox app with Wurlitzer record player, Rolodex song picker, and sign-up wizard integrated into a unified visual frame.

**Architecture:** Component-first layout where functional components (Wurlitzer, Rolodex, SignUpWizard) drive sizing, wrapped by decorative frame components. Central state machine (`useJukeboxState`) coordinates wizard flow and triggers Wurlitzer playback.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, shadcn/ui components

---

## Task 1: Create Types

**Files:**
- Create: `src/types/jukebox.ts`

**Step 1: Create the types file**

```typescript
// src/types/jukebox.ts

export type Song = {
  id: string;
  number: string;  // Display number like "154" or "A7"
  title: string;
  artist: string;
  year?: number;
};

export type QueueEntry = {
  id: string;
  name: string;
  song: Song;
  ticketNumber: string;
  timestamp: number;
};

export type WizardState =
  | "idle"
  | "song-selected"
  | "enter-name"
  | "playing"
  | "payment"
  | "complete";
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no type errors

**Step 3: Commit**

```bash
git add src/types/jukebox.ts
git commit -m "feat: add jukebox types for Song, QueueEntry, WizardState"
```

---

## Task 2: Create useQueue Hook

**Files:**
- Create: `src/hooks/useQueue.ts`

**Step 1: Create the queue hook**

```typescript
// src/hooks/useQueue.ts
import { useState, useCallback } from "react";
import type { Song, QueueEntry } from "@/types/jukebox";

function generateTicketNumber(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${letter}-${number}`;
}

export function useQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);

  const addToQueue = useCallback((name: string, song: Song): QueueEntry => {
    // Placeholder: would POST to backend in future
    const entry: QueueEntry = {
      id: crypto.randomUUID(),
      name,
      song,
      ticketNumber: generateTicketNumber(),
      timestamp: Date.now(),
    };
    setQueue((prev) => [...prev, entry]);
    return entry;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return { queue, addToQueue, removeFromQueue, clearQueue };
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/hooks/useQueue.ts
git commit -m "feat: add useQueue hook for queue management"
```

---

## Task 3: Create useJukeboxState Hook

**Files:**
- Create: `src/hooks/useJukeboxState.ts`

**Step 1: Create the state machine hook**

```typescript
// src/hooks/useJukeboxState.ts
import { useState, useCallback } from "react";
import type { Song, QueueEntry, WizardState } from "@/types/jukebox";
import { useQueue } from "./useQueue";

export function useJukeboxState() {
  const [wizardState, setWizardState] = useState<WizardState>("idle");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [userName, setUserName] = useState("");
  const [lastEntry, setLastEntry] = useState<QueueEntry | null>(null);
  const { queue, addToQueue, removeFromQueue, clearQueue } = useQueue();

  const selectSong = useCallback((song: Song) => {
    setSelectedSong(song);
    setWizardState("song-selected");
  }, []);

  const startSignUp = useCallback(() => {
    if (selectedSong) {
      setWizardState("enter-name");
    }
  }, [selectedSong]);

  const submitName = useCallback((name: string) => {
    setUserName(name);
    setWizardState("playing");
  }, []);

  const onPlayComplete = useCallback(() => {
    setWizardState("payment");
  }, []);

  const submitPayment = useCallback(() => {
    if (selectedSong && userName) {
      const entry = addToQueue(userName, selectedSong);
      setLastEntry(entry);
      setWizardState("complete");
    }
  }, [selectedSong, userName, addToQueue]);

  const reset = useCallback(() => {
    setWizardState("idle");
    setSelectedSong(null);
    setUserName("");
    setLastEntry(null);
  }, []);

  return {
    // State
    wizardState,
    selectedSong,
    userName,
    lastEntry,
    queue,

    // Actions
    selectSong,
    startSignUp,
    submitName,
    onPlayComplete,
    submitPayment,
    reset,
    removeFromQueue,
    clearQueue,
  };
}

export type JukeboxStateReturn = ReturnType<typeof useJukeboxState>;
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/hooks/useJukeboxState.ts
git commit -m "feat: add useJukeboxState hook for wizard flow"
```

---

## Task 4: Create SignUpWizard Component

**Files:**
- Create: `src/components/jukebox/SignUpWizard.tsx`

**Step 1: Create the directory**

Run: `mkdir -p src/components/jukebox`

**Step 2: Create the SignUpWizard component**

```typescript
// src/components/jukebox/SignUpWizard.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WizardState, Song, QueueEntry } from "@/types/jukebox";

type Props = {
  wizardState: WizardState;
  selectedSong: Song | null;
  lastEntry: QueueEntry | null;
  onStartSignUp: () => void;
  onSubmitName: (name: string) => void;
  onSubmitPayment: () => void;
  onReset: () => void;
};

export function SignUpWizard({
  wizardState,
  selectedSong,
  lastEntry,
  onStartSignUp,
  onSubmitName,
  onSubmitPayment,
  onReset,
}: Props) {
  const [nameInput, setNameInput] = useState("");

  // Auto-reset after complete
  useEffect(() => {
    if (wizardState === "complete") {
      const timer = setTimeout(onReset, 3000);
      return () => clearTimeout(timer);
    }
  }, [wizardState, onReset]);

  return (
    <div className="flex h-full items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {wizardState === "idle" && (
          <WizardPanel key="idle">
            <p className="text-lg text-amber-100">Pick a song to get started!</p>
          </WizardPanel>
        )}

        {wizardState === "song-selected" && selectedSong && (
          <WizardPanel key="song-selected">
            <p className="text-sm text-amber-200">You selected:</p>
            <p className="mt-1 text-lg font-bold text-amber-50">{selectedSong.title}</p>
            <p className="text-sm text-amber-300">{selectedSong.artist}</p>
            <Button
              onClick={onStartSignUp}
              className="mt-4 bg-rose-600 hover:bg-rose-500"
            >
              Sign Up to Sing
            </Button>
          </WizardPanel>
        )}

        {wizardState === "enter-name" && (
          <WizardPanel key="enter-name">
            <p className="mb-3 text-amber-100">Enter your name:</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (nameInput.trim()) {
                  onSubmitName(nameInput.trim());
                }
              }}
              className="flex gap-2"
            >
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="bg-neutral-800 border-amber-600 text-amber-50"
                autoFocus
              />
              <Button type="submit" className="bg-amber-600 hover:bg-amber-500">
                Next
              </Button>
            </form>
          </WizardPanel>
        )}

        {wizardState === "playing" && (
          <WizardPanel key="playing">
            <p className="text-amber-200">Now playing preview...</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
              <span className="text-sm text-amber-300">Watch the Wurlitzer!</span>
            </div>
          </WizardPanel>
        )}

        {wizardState === "payment" && (
          <WizardPanel key="payment">
            <p className="mb-2 text-amber-100">Insert a coin to confirm:</p>
            <Button
              onClick={onSubmitPayment}
              className="bg-amber-500 text-amber-950 hover:bg-amber-400"
            >
              🪙 Insert Coin
            </Button>
          </WizardPanel>
        )}

        {wizardState === "complete" && lastEntry && (
          <WizardPanel key="complete">
            <p className="text-lg text-green-400">You're in the queue!</p>
            <p className="mt-2 font-mono text-2xl font-bold text-amber-100">
              {lastEntry.ticketNumber}
            </p>
            <p className="mt-1 text-sm text-amber-300">
              {lastEntry.name} - {lastEntry.song.title}
            </p>
          </WizardPanel>
        )}
      </AnimatePresence>
    </div>
  );
}

function WizardPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="text-center"
    >
      {children}
    </motion.div>
  );
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/jukebox/SignUpWizard.tsx
git commit -m "feat: add SignUpWizard component for multi-step sign-up flow"
```

---

## Task 5: Create QueueDisplay Component

**Files:**
- Create: `src/components/jukebox/QueueDisplay.tsx`

**Step 1: Create the QueueDisplay component**

```typescript
// src/components/jukebox/QueueDisplay.tsx
import { motion, AnimatePresence } from "framer-motion";
import type { QueueEntry } from "@/types/jukebox";

type Props = {
  queue: QueueEntry[];
};

export function QueueDisplay({ queue }: Props) {
  if (queue.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-500">
        No one in queue yet
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
        Up Next ({queue.length})
      </p>
      <ul className="space-y-1">
        <AnimatePresence>
          {queue.map((entry, index) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 rounded bg-neutral-800/50 px-2 py-1"
            >
              <span className="font-mono text-xs text-amber-500">
                {index + 1}.
              </span>
              <span className="flex-1 truncate text-sm text-neutral-200">
                {entry.name}
              </span>
              <span className="truncate text-xs text-neutral-400">
                {entry.song.title}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/jukebox/QueueDisplay.tsx
git commit -m "feat: add QueueDisplay component for showing queue"
```

---

## Task 6: Create Frame Components

**Files:**
- Create: `src/components/jukebox/ArchFrame.tsx`
- Create: `src/components/jukebox/PanelFrame.tsx`
- Create: `src/components/jukebox/BaseFrame.tsx`

**Step 1: Create ArchFrame**

```typescript
// src/components/jukebox/ArchFrame.tsx
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function ArchFrame({ children, className }: Props) {
  return (
    <div className={cn("relative", className)}>
      {/* SVG arch background */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 280"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="archWood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="50%" stopColor="#4A3728" />
            <stop offset="100%" stopColor="#2D1F16" />
          </linearGradient>
          <linearGradient id="archGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B7355" />
            <stop offset="50%" stopColor="#C4A35A" />
            <stop offset="100%" stopColor="#8B7355" />
          </linearGradient>
        </defs>
        {/* Outer arch shape */}
        <path
          d="M 0 280 L 0 100 Q 0 0 200 0 Q 400 0 400 100 L 400 280 Z"
          fill="url(#archWood)"
        />
        {/* Gold trim at arch edge */}
        <path
          d="M 10 280 L 10 100 Q 10 10 200 10 Q 390 10 390 100 L 390 280"
          fill="none"
          stroke="url(#archGold)"
          strokeWidth="4"
        />
      </svg>
      {/* Content area (inset from frame) */}
      <div className="relative z-10 mx-6 mt-4 mb-2 overflow-hidden rounded-t-[80px] bg-gradient-to-b from-rose-950/80 via-neutral-950 to-neutral-900">
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Create PanelFrame**

```typescript
// src/components/jukebox/PanelFrame.tsx
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function PanelFrame({ children, className }: Props) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-4 border-amber-600/80 bg-amber-500 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.3)]",
        className
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-amber-600/50 p-1">
        {children}
      </div>
    </div>
  );
}
```

**Step 3: Create BaseFrame**

```typescript
// src/components/jukebox/BaseFrame.tsx
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function BaseFrame({ children, className }: Props) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-neutral-600 bg-gradient-to-b from-neutral-800 to-neutral-900 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {/* Chrome accent line at top */}
      <div className="absolute inset-x-4 top-0 h-0.5 bg-gradient-to-r from-transparent via-neutral-400 to-transparent" />
      {children}
    </div>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/jukebox/ArchFrame.tsx src/components/jukebox/PanelFrame.tsx src/components/jukebox/BaseFrame.tsx
git commit -m "feat: add visual frame components (ArchFrame, PanelFrame, BaseFrame)"
```

---

## Task 7: Create JukeboxFrame Container

**Files:**
- Create: `src/components/jukebox/JukeboxFrame.tsx`

**Step 1: Create the JukeboxFrame component**

```typescript
// src/components/jukebox/JukeboxFrame.tsx
import { ArchFrame } from "./ArchFrame";
import { PanelFrame } from "./PanelFrame";
import { BaseFrame } from "./BaseFrame";

type Props = {
  wurlitzer: React.ReactNode;
  rolodex: React.ReactNode;
  wizard: React.ReactNode;
  queue?: React.ReactNode;
};

export function JukeboxFrame({ wurlitzer, rolodex, wizard, queue }: Props) {
  return (
    <div className="mx-auto w-full max-w-[500px]">
      {/* Outer jukebox shell */}
      <div className="rounded-t-[120px] bg-gradient-to-b from-amber-800 via-amber-900 to-neutral-900 p-3 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
        {/* Top arch section - Wurlitzer */}
        <ArchFrame className="h-[260px]">
          {wurlitzer}
        </ArchFrame>

        {/* Middle section - Rolodex song picker */}
        <div className="mt-3">
          <PanelFrame className="min-h-[200px]">
            {rolodex}
          </PanelFrame>
        </div>

        {/* Bottom section - Sign-up wizard */}
        <div className="mt-3">
          <BaseFrame className="min-h-[120px]">
            {wizard}
          </BaseFrame>
        </div>

        {/* Optional queue display */}
        {queue && (
          <div className="mt-3">
            <BaseFrame className="min-h-[100px]">
              {queue}
            </BaseFrame>
          </div>
        )}
      </div>

      {/* Jukebox base */}
      <div className="h-8 rounded-b-xl bg-gradient-to-b from-neutral-800 to-neutral-950 shadow-lg" />
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/jukebox/JukeboxFrame.tsx
git commit -m "feat: add JukeboxFrame container component"
```

---

## Task 8: Extract Wurlitzer as Standalone Component

**Files:**
- Create: `src/components/jukebox/Wurlitzer.tsx`

**Step 1: Create Wurlitzer component**

Extract the WurlitzerEmbed and Record components from `src/pages/Jukebox.tsx` into a standalone component with a callback for when play completes.

```typescript
// src/components/jukebox/Wurlitzer.tsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlayState = "idle" | "sliding" | "rising" | "lifting" | "playing";

type Props = {
  triggerPlay?: boolean;
  onPlayComplete?: () => void;
  showControls?: boolean;
};

export function Wurlitzer({ triggerPlay, onPlayComplete, showControls = true }: Props) {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentRecord, setCurrentRecord] = useState(0);

  const recordStackY = (14 - currentRecord) * 8;

  const handlePlay = useCallback(() => {
    if (playState !== "idle") return;
    setPlayState("sliding");
    setTimeout(() => setPlayState("rising"), 800);
    setTimeout(() => setPlayState("lifting"), 1400);
    setTimeout(() => setPlayState("playing"), 2000);
  }, [playState]);

  // External trigger
  useEffect(() => {
    if (triggerPlay && playState === "idle") {
      handlePlay();
    }
  }, [triggerPlay, playState, handlePlay]);

  // Notify when playing completes (after ~3 seconds of playing)
  useEffect(() => {
    if (playState === "playing") {
      const timer = setTimeout(() => {
        onPlayComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [playState, onPlayComplete]);

  function handleReset() {
    setPlayState("idle");
    setCurrentRecord((r) => (r + 1) % 15);
  }

  return (
    <div className="relative h-full w-full">
      {/* Player Stage */}
      <div
        className="relative mx-auto h-full w-full overflow-hidden bg-transparent"
        style={{ perspective: "800px" }}
      >
        {/* 3D Stage */}
        <div
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(15deg)",
            transformOrigin: "center 100%",
          }}
        >
          {/* Record Stack (left) */}
          <div className="absolute bottom-12 left-6">
            {[...Array(15)].map((_, i) => {
              const isTop = i === currentRecord;
              const hide = isTop && playState !== "idle";
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ bottom: (14 - i) * 8, zIndex: 15 - i }}
                  animate={{ opacity: hide ? 0 : 1 }}
                >
                  <Record isActive={isTop} />
                </motion.div>
              );
            })}
            {/* Spindle */}
            <div className="absolute bottom-0 left-1/2 h-36 w-2 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
          </div>

          {/* Sliding/Lifting Record */}
          <AnimatePresence>
            {playState !== "idle" && (
              <motion.div
                className="absolute left-6"
                style={{ zIndex: 15 - currentRecord, transform: "translateZ(0)" }}
                initial={{ x: 0, bottom: 12 + recordStackY }}
                animate={{
                  x: 210,
                  bottom:
                    playState === "lifting" || playState === "playing"
                      ? 12 + recordStackY + 30
                      : 12 + recordStackY,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 50, damping: 12 }}
              >
                <div className={playState === "playing" ? "animate-spin-record" : ""}>
                  <Record isActive spinning={playState === "playing"} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Platter with lift column */}
          <motion.div
            className="absolute left-6"
            style={{ x: 210, transform: "translateZ(0)" }}
            initial={{ bottom: 12 }}
            animate={{
              bottom:
                playState === "rising"
                  ? 12 + recordStackY
                  : playState === "lifting" || playState === "playing"
                    ? 12 + recordStackY + 30
                    : 12,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 12 }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-48 w-6 -translate-x-1/2 rounded-b-lg bg-gradient-to-b from-neutral-500 via-neutral-600 to-neutral-700"
              style={{
                boxShadow:
                  "inset 2px 0 4px rgba(255,255,255,0.1), inset -2px 0 4px rgba(0,0,0,0.3)",
              }}
            />
            <div
              className="relative h-36 w-36 rounded-full bg-gradient-to-b from-neutral-600 to-neutral-800"
              style={{
                boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
                transform: "rotateX(65deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="absolute inset-2 rounded-full bg-neutral-700" />
              <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500" />
            </div>
          </motion.div>

          {/* Tonearm */}
          <motion.div
            className="absolute"
            style={{
              right: 5,
              bottom: 12 + recordStackY + 110,
              zIndex: 50,
              transformOrigin: "right center",
            }}
            animate={{ rotate: playState === "playing" ? 8 : 15 }}
            transition={{ type: "spring", stiffness: 80, damping: 12, delay: 0.2 }}
          >
            <div className="h-1.5 w-20 rounded-full bg-amber-500" />
            <div className="absolute -top-1 left-0 h-3 w-4 rounded-sm bg-amber-400" />
            <div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-amber-600" />
          </motion.div>
        </div>

        {/* Floor fade */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-900 to-transparent" />
      </div>

      {/* Mini Controls */}
      {showControls && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
          {playState === "idle" ? (
            <Button
              onClick={handlePlay}
              size="sm"
              className="h-8 rounded-full bg-rose-600 px-3 hover:bg-rose-500"
            >
              <Play className="h-3 w-3" />
            </Button>
          ) : playState === "playing" ? (
            <Button
              onClick={handleReset}
              size="sm"
              variant="secondary"
              className="h-8 rounded-full px-3"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Record({
  isActive = false,
  spinning = false,
}: {
  isActive?: boolean;
  spinning?: boolean;
}) {
  return (
    <div
      className={`h-36 w-36 overflow-hidden rounded-full ${
        isActive ? "border-2 border-rose-800/50" : "border-2 border-neutral-800/50"
      }`}
      style={{
        background: isActive
          ? "radial-gradient(circle, #1f1f1f 25%, #0a0a0a 70%)"
          : "radial-gradient(circle, #181818 25%, #080808 70%)",
        boxShadow: spinning
          ? "0 8px 32px rgba(0,0,0,0.8)"
          : "0 4px 16px rgba(0,0,0,0.6)",
        transform: "rotateX(65deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {[0, 45, 90, 135].map((angle) => (
        <div
          key={angle}
          className="absolute left-1/2 top-1/2 h-0.5 w-full origin-left -translate-y-1/2"
          style={{
            transform: `rotate(${angle}deg)`,
            background:
              "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent 80%)",
          }}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-700/30" />
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-700/20" />
      <div
        className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          isActive
            ? "bg-gradient-to-br from-rose-600 to-rose-800"
            : "bg-gradient-to-br from-amber-700 to-amber-900"
        }`}
      >
        <div
          className="absolute h-2 w-2 rounded-full bg-white/20"
          style={{ top: "25%", left: "60%" }}
        />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/jukebox/Wurlitzer.tsx
git commit -m "feat: extract Wurlitzer as standalone component with play callbacks"
```

---

## Task 9: Extract Rolodex as Standalone Component

**Files:**
- Create: `src/components/jukebox/Rolodex.tsx`

**Step 1: Create Rolodex component**

Extract from `src/pages/Jukebox.tsx` with an `onSelectSong` callback.

```typescript
// src/components/jukebox/Rolodex.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Song } from "@/types/jukebox";

// Internal song format with number as number
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
      try {
        await ctx.resume();
      } catch {
        /* ignore */
      }
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

  const handleSongClick = (internal: InternalSong) => {
    onSelectSong?.(toSong(internal));
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Split-flap display */}
      <div className="flex-1" style={{ perspective: "1200px" }}>
        <SplitFlapPanel page={currentPage} onSongClick={handleSongClick} />
      </div>

      {/* Navigation arrows */}
      <div className="mt-2 flex justify-center gap-2">
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
  onSongClick,
}: {
  page: { top: InternalSong[]; bottom: InternalSong[] };
  onSongClick: (song: InternalSong) => void;
}) {
  return (
    <div className="relative h-full select-none">
      <div className="relative h-full overflow-hidden rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="h-[calc(50%-2px)] bg-gradient-to-b from-amber-100 to-amber-50">
          <SongStrips songs={page.top} onSongClick={onSongClick} />
        </div>
        <div className="h-1 bg-gradient-to-b from-amber-800/60 via-amber-900/80 to-amber-800/60" />
        <div className="h-[calc(50%-2px)] bg-gradient-to-b from-amber-50 to-amber-100">
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
  onSongClick,
}: {
  songs: InternalSong[];
  onSongClick: (song: InternalSong) => void;
}) {
  return (
    <div className="grid h-full grid-cols-3 gap-px bg-amber-300/50 p-1.5">
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

function SongCard({ song, onClick }: { song: InternalSong; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col overflow-hidden rounded bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_3px_rgba(0,0,0,0.2)] transition-transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500"
    >
      <div className="flex-1 border-b border-amber-200/80 px-1.5 py-0.5">
        <div className="flex items-start gap-1">
          <span className="font-mono text-[10px] font-bold text-amber-900">{song.no}</span>
          <span className="flex-1 truncate text-[9px] font-semibold uppercase leading-tight tracking-tight text-amber-950">
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
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/jukebox/Rolodex.tsx
git commit -m "feat: extract Rolodex as standalone component with song selection callback"
```

---

## Task 10: Create Component Index

**Files:**
- Create: `src/components/jukebox/index.ts`

**Step 1: Create index file**

```typescript
// src/components/jukebox/index.ts
export { JukeboxFrame } from "./JukeboxFrame";
export { ArchFrame } from "./ArchFrame";
export { PanelFrame } from "./PanelFrame";
export { BaseFrame } from "./BaseFrame";
export { Wurlitzer } from "./Wurlitzer";
export { Rolodex } from "./Rolodex";
export { SignUpWizard } from "./SignUpWizard";
export { QueueDisplay } from "./QueueDisplay";
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/jukebox/index.ts
git commit -m "feat: add jukebox component barrel export"
```

---

## Task 11: Rewrite Jukebox Page

**Files:**
- Modify: `src/pages/Jukebox.tsx`

**Step 1: Rewrite the Jukebox page**

Replace the entire file with:

```typescript
// src/pages/Jukebox.tsx
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  JukeboxFrame,
  Wurlitzer,
  Rolodex,
  SignUpWizard,
  QueueDisplay,
} from "@/components/jukebox";
import { useJukeboxState } from "@/hooks/useJukeboxState";

export default function Jukebox() {
  const state = useJukeboxState();

  // Trigger Wurlitzer when entering "playing" state
  const shouldTriggerPlay = state.wizardState === "playing";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="absolute left-4 top-4 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-lg bg-neutral-900/80 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Jukebox */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <JukeboxFrame
          wurlitzer={
            <Wurlitzer
              triggerPlay={shouldTriggerPlay}
              onPlayComplete={state.onPlayComplete}
              showControls={state.wizardState === "idle"}
            />
          }
          rolodex={
            <Rolodex onSelectSong={state.selectSong} />
          }
          wizard={
            <SignUpWizard
              wizardState={state.wizardState}
              selectedSong={state.selectedSong}
              lastEntry={state.lastEntry}
              onStartSignUp={state.startSignUp}
              onSubmitName={state.submitName}
              onSubmitPayment={state.submitPayment}
              onReset={state.reset}
            />
          }
          queue={
            state.queue.length > 0 ? (
              <QueueDisplay queue={state.queue} />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Test manually**

Run: `npm run dev`
Open: `http://localhost:5173/rockyoke/jukebox`
Verify:
- Jukebox displays with component-first layout
- Clicking a song card shows "Sign Up" button
- Name entry works
- Wurlitzer plays when entering "playing" state
- Payment confirmation works
- Queue displays after completion

**Step 4: Commit**

```bash
git add src/pages/Jukebox.tsx
git commit -m "feat: rewrite Jukebox page to use component-first architecture"
```

---

## Task 12: Add CSS Variables

**Files:**
- Modify: `src/index.css`

**Step 1: Add jukebox color variables**

Add these CSS variables to the existing file:

```css
/* After line 11 (after body rule) */

/* Jukebox color palette */
:root {
  --jukebox-cream: #F5E6D3;
  --jukebox-gold: #C4A35A;
  --jukebox-dark-wood: #4A3728;
  --jukebox-medium-wood: #8B6914;
  --jukebox-chrome: #B8B8B8;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add jukebox color palette CSS variables"
```

---

## Task 13: Clean Up Old Embedded Components

**Files:**
- Remove embedded WurlitzerEmbed from `src/pages/Jukebox.tsx` (already done in Task 11)
- Remove embedded RolodexEmbed from `src/pages/Jukebox.tsx` (already done in Task 11)

This task is complete - the rewrite in Task 11 already removed the embedded components.

**Step 1: Verify the old embedded components are gone**

Run: `npm run build`
Expected: Build succeeds without the old WurlitzerEmbed/RolodexEmbed

---

## Task 14: Final Integration Test

**Step 1: Build the project**

Run: `npm run build`
Expected: Build succeeds

**Step 2: Manual test flow**

Run: `npm run dev`

Test the complete flow:
1. Navigate to `/rockyoke/jukebox`
2. Verify jukebox renders with arch, panel, and base frames
3. Click a song in the Rolodex
4. Verify wizard shows "Sign Up to Sing" button
5. Click sign up, enter name, submit
6. Verify Wurlitzer plays automatically
7. Click "Insert Coin"
8. Verify ticket number displays
9. Verify queue shows the entry
10. Wait for auto-reset to idle state

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete jukebox implementation with wizard flow and queue"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create types | `src/types/jukebox.ts` |
| 2 | Create useQueue hook | `src/hooks/useQueue.ts` |
| 3 | Create useJukeboxState hook | `src/hooks/useJukeboxState.ts` |
| 4 | Create SignUpWizard | `src/components/jukebox/SignUpWizard.tsx` |
| 5 | Create QueueDisplay | `src/components/jukebox/QueueDisplay.tsx` |
| 6 | Create Frame components | `ArchFrame.tsx`, `PanelFrame.tsx`, `BaseFrame.tsx` |
| 7 | Create JukeboxFrame | `src/components/jukebox/JukeboxFrame.tsx` |
| 8 | Extract Wurlitzer | `src/components/jukebox/Wurlitzer.tsx` |
| 9 | Extract Rolodex | `src/components/jukebox/Rolodex.tsx` |
| 10 | Create component index | `src/components/jukebox/index.ts` |
| 11 | Rewrite Jukebox page | `src/pages/Jukebox.tsx` |
| 12 | Add CSS variables | `src/index.css` |
| 13 | Clean up (done in 11) | - |
| 14 | Final integration test | - |
