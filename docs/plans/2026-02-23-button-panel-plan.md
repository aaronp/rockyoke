# Button Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add vintage punch-in buttons for song code entry (A01-K06) with LED display, replacing the current round button area.

**Architecture:** Create a new ButtonPanel component with input state machine, integrate it into JukeboxShell as slot 4, refactor Rolodex to accept controlled page state, and update song IDs to use letter+number codes.

**Tech Stack:** React, TypeScript, Tailwind CSS, Framer Motion (for press animations)

---

### Task 1: Update Song Code System in Rolodex

**Files:**
- Modify: `src/components/jukebox/Rolodex.tsx`

**Step 1: Update the toSong function to generate letter codes**

Change the `toSong` function to compute codes based on page position:

```typescript
function toSong(internal: InternalSong, pageIndex: number, indexOnPage: number): Song {
  const letter = String.fromCharCode(65 + pageIndex); // A=0, B=1, etc.
  const number = String(indexOnPage + 1).padStart(2, '0'); // 01-06
  const code = `${letter}${number}`;
  return {
    id: code,
    number: code,
    title: internal.title,
    artist: internal.artist,
    year: internal.year,
  };
}
```

**Step 2: Update handleSongClick to pass page context**

```typescript
const handleSongClick = useCallback((internal: InternalSong, indexOnPage: number) => {
  if (onSelectSong) {
    onSelectSong(toSong(internal, pageIndex, indexOnPage));
  }
}, [onSelectSong, pageIndex]);
```

**Step 3: Update SongStrips and SongCard to pass index**

In `SongStrips`, pass the index to the click handler:
```typescript
{songs.map((song, index) => (
  <SongCard key={song.no} song={song} onClick={() => onSongClick(song, index)} />
))}
```

**Step 4: Update SongCard to display the code**

The song number display should show the code. Since SongCard doesn't have access to page context, we need to pass it. Update the component to accept a `displayNumber` prop:

```typescript
function SongCard({
  song,
  displayNumber,
  onClick
}: {
  song: InternalSong;
  displayNumber: string;
  onClick: () => void;
}) {
  // ... use displayNumber instead of song.no
}
```

**Step 5: Commit**

```bash
git add src/components/jukebox/Rolodex.tsx
git commit -m "feat: update song codes to letter+number format (A01-K06)"
```

---

### Task 2: Make Rolodex Accept Controlled Page State

**Files:**
- Modify: `src/components/jukebox/Rolodex.tsx`

**Step 1: Update Props type**

```typescript
type Props = {
  onSelectSong?: (song: Song) => void;
  pageIndex?: number;           // Controlled page index
  onPageChange?: (index: number) => void;  // Callback when page changes
};
```

**Step 2: Use controlled or internal state**

```typescript
export function Rolodex({ onSelectSong, pageIndex: controlledPageIndex, onPageChange }: Props) {
  const pages = getPages(SONGS);
  const [internalPageIndex, setInternalPageIndex] = useState(0);

  // Use controlled if provided, otherwise internal
  const pageIndex = controlledPageIndex ?? internalPageIndex;
  const setPageIndex = onPageChange ?? setInternalPageIndex;

  // ... rest of component uses pageIndex and setPageIndex
```

**Step 3: Update goUp and goDown to use the setter**

```typescript
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
```

**Step 4: Commit**

```bash
git add src/components/jukebox/Rolodex.tsx
git commit -m "feat: make Rolodex accept controlled page state"
```

---

### Task 3: Remove Navigation Buttons from Rolodex

**Files:**
- Modify: `src/components/jukebox/Rolodex.tsx`

**Step 1: Remove the navigation button JSX**

Delete this section from the return statement:
```typescript
{/* Navigation arrows - positioned on the right */}
<div className="flex flex-col justify-center gap-1 pl-2">
  <Button ...>
    <ChevronUp ... />
  </Button>
  <Button ...>
    <ChevronDown ... />
  </Button>
</div>
```

**Step 2: Simplify the layout**

Change the outer div from flex layout:
```typescript
return (
  <div className="w-full h-full">
    <div className="h-full" style={{ perspective: "1200px" }}>
      <SplitFlapPanel page={currentPage} onSongClick={handleSongClick} />
    </div>
  </div>
);
```

**Step 3: Remove unused imports**

Remove `ChevronUp`, `ChevronDown` from lucide-react imports, and `Button` from ui imports.

**Step 4: Commit**

```bash
git add src/components/jukebox/Rolodex.tsx
git commit -m "refactor: remove navigation buttons from Rolodex"
```

---

### Task 4: Create ButtonPanel Component - LED Display

**Files:**
- Create: `src/components/jukebox/ButtonPanel.tsx`

**Step 1: Create the file with LED display component**

```typescript
// src/components/jukebox/ButtonPanel.tsx
import { useState, useCallback, useEffect, useRef } from "react";

type DisplayState = "normal" | "error" | "success";

function LEDDisplay({ value, state }: { value: string; state: DisplayState }) {
  // Pad to 3 characters, use underscore for empty
  const display = value.padEnd(3, "_");

  const bgColor = state === "error"
    ? "bg-red-900/80"
    : state === "success"
    ? "bg-green-900/80"
    : "bg-neutral-900";

  const textColor = state === "error"
    ? "text-red-400"
    : state === "success"
    ? "text-green-400"
    : "text-amber-400";

  return (
    <div className={`${bgColor} rounded-lg px-4 py-2 border-2 border-neutral-700 shadow-inner`}>
      <div className={`font-mono text-2xl font-bold tracking-[0.3em] ${textColor}`}
           style={{ textShadow: state === "normal" ? "0 0 10px currentColor" : "none" }}>
        {display.split("").map((char, i) => (
          <span key={i} className="inline-block w-6 text-center">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

export { LEDDisplay };
```

**Step 2: Commit**

```bash
git add src/components/jukebox/ButtonPanel.tsx
git commit -m "feat: add LED display component for ButtonPanel"
```

---

### Task 5: Create ButtonPanel Component - Vintage Button

**Files:**
- Modify: `src/components/jukebox/ButtonPanel.tsx`

**Step 1: Add VintageButton component**

```typescript
type VintageButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "letter" | "number" | "action";
  wide?: boolean;
};

function VintageButton({ label, onClick, disabled, variant = "letter", wide }: VintageButtonProps) {
  const baseStyles = "font-mono font-bold uppercase transition-all duration-75 select-none";
  const sizeStyles = wide ? "px-3 py-1.5 text-xs" : "w-7 h-7 text-sm";

  const variantStyles = {
    letter: "bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900 border-amber-300",
    number: "bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900 border-amber-300",
    action: "bg-gradient-to-b from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles} ${sizeStyles} ${variantStyles[variant]}
        rounded border-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_0_rgba(0,0,0,0.2),0_3px_3px_rgba(0,0,0,0.1)]
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_0_rgba(0,0,0,0.2),0_2px_2px_rgba(0,0,0,0.1)]
        active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]
        active:translate-y-0.5
        disabled:opacity-40 disabled:cursor-not-allowed
        flex items-center justify-center
      `}
    >
      {label}
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/jukebox/ButtonPanel.tsx
git commit -m "feat: add VintageButton component"
```

---

### Task 6: Create ButtonPanel Component - Main Component

**Files:**
- Modify: `src/components/jukebox/ButtonPanel.tsx`

**Step 1: Add the main ButtonPanel component**

```typescript
type Props = {
  onSelectSong: (code: string) => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  canNavigateUp?: boolean;
  canNavigateDown?: boolean;
};

export function ButtonPanel({
  onSelectSong,
  onNavigateUp,
  onNavigateDown,
  canNavigateUp = true,
  canNavigateDown = true,
}: Props) {
  const [input, setInput] = useState("");
  const [displayState, setDisplayState] = useState<DisplayState>("normal");

  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
  const numbers = ["0", "1", "2", "3", "4", "5", "6"];

  const handleLetterPress = useCallback((letter: string) => {
    // Letter always replaces/sets first character
    setInput(letter);
    setDisplayState("normal");
  }, []);

  const handleNumberPress = useCallback((num: string) => {
    setInput(prev => {
      // Must have letter first
      if (prev.length === 0) return prev;
      // Max 3 characters (letter + 2 digits)
      if (prev.length >= 3) return prev;
      return prev + num;
    });
    setDisplayState("normal");
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setDisplayState("normal");
  }, []);

  const handleEnter = useCallback(() => {
    if (input.length !== 3) {
      setDisplayState("error");
      setTimeout(() => setDisplayState("normal"), 300);
      return;
    }

    const letter = input[0];
    const num = parseInt(input.slice(1), 10);

    // Validate: letter A-K, number 01-06
    const letterIndex = letter.charCodeAt(0) - 65;
    if (letterIndex < 0 || letterIndex > 10 || num < 1 || num > 6) {
      setDisplayState("error");
      setTimeout(() => setDisplayState("normal"), 300);
      return;
    }

    setDisplayState("success");
    onSelectSong(input);
    setTimeout(() => {
      setInput("");
      setDisplayState("normal");
    }, 500);
  }, [input, onSelectSong]);

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      {/* LED Display */}
      <LEDDisplay value={input} state={displayState} />

      {/* Letter row */}
      <div className="flex gap-1">
        {letters.map(letter => (
          <VintageButton
            key={letter}
            label={letter}
            onClick={() => handleLetterPress(letter)}
            variant="letter"
          />
        ))}
      </div>

      {/* Number row + controls */}
      <div className="flex gap-1 items-center">
        {numbers.map(num => (
          <VintageButton
            key={num}
            label={num}
            onClick={() => handleNumberPress(num)}
            variant="number"
          />
        ))}

        <div className="w-2" /> {/* Spacer */}

        <VintageButton label="▲" onClick={onNavigateUp} variant="action" disabled={!canNavigateUp} />
        <VintageButton label="▼" onClick={onNavigateDown} variant="action" disabled={!canNavigateDown} />

        <div className="w-2" /> {/* Spacer */}

        <VintageButton label="CLR" onClick={handleClear} variant="action" wide />
        <VintageButton label="OK" onClick={handleEnter} variant="action" wide />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/jukebox/ButtonPanel.tsx
git commit -m "feat: add main ButtonPanel component with input logic"
```

---

### Task 7: Add Keyboard Support to ButtonPanel

**Files:**
- Modify: `src/components/jukebox/ButtonPanel.tsx`

**Step 1: Add useEffect for keyboard handling**

Add inside the ButtonPanel component, after the handlers:

```typescript
// Keyboard support
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    const key = e.key.toUpperCase();

    // Letters A-K
    if (key >= "A" && key <= "K") {
      e.preventDefault();
      handleLetterPress(key);
    }
    // Numbers 0-6
    else if (key >= "0" && key <= "6") {
      e.preventDefault();
      handleNumberPress(key);
    }
    // Backspace = Clear
    else if (e.key === "Backspace") {
      e.preventDefault();
      handleClear();
    }
    // Enter = Submit
    else if (e.key === "Enter") {
      e.preventDefault();
      handleEnter();
    }
    // Arrow keys = Navigate
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (canNavigateUp) onNavigateUp();
    }
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (canNavigateDown) onNavigateDown();
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [handleLetterPress, handleNumberPress, handleClear, handleEnter, onNavigateUp, onNavigateDown, canNavigateUp, canNavigateDown]);
```

**Step 2: Commit**

```bash
git add src/components/jukebox/ButtonPanel.tsx
git commit -m "feat: add keyboard support to ButtonPanel"
```

---

### Task 8: Add Click Sound to ButtonPanel

**Files:**
- Modify: `src/components/jukebox/ButtonPanel.tsx`

**Step 1: Copy useClackSfx hook from Rolodex or import it**

Add at the top of the file (copy from Rolodex.tsx):

```typescript
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
```

**Step 2: Use the hook in ButtonPanel**

```typescript
const sfx = useClackSfx();

// Update handlers to play sound
const handleLetterPress = useCallback((letter: string) => {
  sfx.clack(0.7);
  setInput(letter);
  setDisplayState("normal");
}, [sfx]);

const handleNumberPress = useCallback((num: string) => {
  sfx.clack(0.7);
  // ... rest of handler
}, [sfx]);
```

**Step 3: Commit**

```bash
git add src/components/jukebox/ButtonPanel.tsx
git commit -m "feat: add click sound to ButtonPanel buttons"
```

---

### Task 9: Export ButtonPanel and Add to JukeboxShell

**Files:**
- Modify: `src/components/jukebox/index.ts`
- Modify: `src/components/jukebox/JukeboxShell.tsx`

**Step 1: Export ButtonPanel**

```typescript
// src/components/jukebox/index.ts
export { JukeboxShell } from "./JukeboxShell";
export { Wurlitzer } from "./Wurlitzer";
export { Rolodex } from "./Rolodex";
export { SignUpWizard } from "./SignUpWizard";
export { QueueDisplay } from "./QueueDisplay";
export { ButtonPanel } from "./ButtonPanel";
```

**Step 2: Add buttonPanel prop to JukeboxShell**

Update the Props type:
```typescript
type Props = {
  recordPlayer: ReactNode;
  songRolodex: ReactNode;
  buttonPanel: ReactNode;  // New slot
  songQueue: ReactNode;
};
```

**Step 3: Add slot 4 for ButtonPanel**

Add after the songRolodex slot (around line 920):
```typescript
{/* ================================================================
    SLOT 3 -- BUTTON PANEL
    Positioned below the rolodex, in the button area.
    Slot box: x=148 y=555 w=504 h=65 (in SVG coords)
    ================================================================ */}
<SlotOverlay x={148} y={555} w={504} h={65}>
  {buttonPanel}
</SlotOverlay>
```

**Step 4: Renumber slot 4 (song queue) to account for new slot**

Update the song queue comment to say SLOT 4 instead of SLOT 3.

**Step 5: Commit**

```bash
git add src/components/jukebox/index.ts src/components/jukebox/JukeboxShell.tsx
git commit -m "feat: add ButtonPanel slot to JukeboxShell"
```

---

### Task 10: Integrate ButtonPanel in Jukebox.tsx

**Files:**
- Modify: `src/pages/Jukebox.tsx`

**Step 1: Import ButtonPanel**

```typescript
import {
  JukeboxShell,
  Wurlitzer,
  Rolodex,
  SignUpWizard,
  ButtonPanel,
} from "@/components/jukebox";
```

**Step 2: Add page state and handlers**

```typescript
const [rolodexPage, setRolodexPage] = useState(0);
const totalPages = 11; // A-K

const handleNavigateUp = useCallback(() => {
  setRolodexPage(p => Math.max(0, p - 1));
}, []);

const handleNavigateDown = useCallback(() => {
  setRolodexPage(p => Math.min(totalPages - 1, p + 1));
}, []);

const handleCodeEntry = useCallback((code: string) => {
  // Convert code to song and select it
  // Code format: "A01" where A=page 0, 01=song index 1
  const letter = code[0];
  const num = parseInt(code.slice(1), 10);
  const pageIndex = letter.charCodeAt(0) - 65;
  const songIndex = (pageIndex * 6) + num; // 1-indexed within page

  // Create a song object with the code
  const song = {
    id: code,
    number: code,
    title: "", // Will be filled by selectSong if needed
    artist: "",
  };

  state.selectSong(song);
}, [state]);
```

**Step 3: Update JukeboxShell usage**

```typescript
<JukeboxShell
  recordPlayer={...}
  songRolodex={
    <Rolodex
      onSelectSong={state.selectSong}
      pageIndex={rolodexPage}
      onPageChange={setRolodexPage}
    />
  }
  buttonPanel={
    <ButtonPanel
      onSelectSong={handleCodeEntry}
      onNavigateUp={handleNavigateUp}
      onNavigateDown={handleNavigateDown}
      canNavigateUp={rolodexPage > 0}
      canNavigateDown={rolodexPage < totalPages - 1}
    />
  }
  songQueue={...}
/>
```

**Step 4: Commit**

```bash
git add src/pages/Jukebox.tsx
git commit -m "feat: integrate ButtonPanel into Jukebox page"
```

---

### Task 11: Create Song Lookup Utility

**Files:**
- Modify: `src/components/jukebox/Rolodex.tsx`

**Step 1: Export SONGS array and add lookup function**

```typescript
// Export the songs array
export const SONGS: InternalSong[] = [
  // ... existing songs
];

// Add lookup function
export function findSongByCode(code: string): Song | null {
  if (code.length !== 3) return null;

  const letter = code[0];
  const num = parseInt(code.slice(1), 10);
  const pageIndex = letter.charCodeAt(0) - 65;

  if (pageIndex < 0 || pageIndex > 10 || num < 1 || num > 6) return null;

  const songIndex = pageIndex * 6 + (num - 1);
  const internal = SONGS[songIndex];

  if (!internal) return null;

  return {
    id: code,
    number: code,
    title: internal.title,
    artist: internal.artist,
    year: internal.year,
  };
}
```

**Step 2: Commit**

```bash
git add src/components/jukebox/Rolodex.tsx
git commit -m "feat: add findSongByCode utility function"
```

---

### Task 12: Update Jukebox.tsx to Use Song Lookup

**Files:**
- Modify: `src/pages/Jukebox.tsx`

**Step 1: Import findSongByCode**

```typescript
import { findSongByCode } from "@/components/jukebox/Rolodex";
```

**Step 2: Update handleCodeEntry to use the lookup**

```typescript
const handleCodeEntry = useCallback((code: string) => {
  const song = findSongByCode(code);
  if (song) {
    state.selectSong(song);
  }
}, [state]);
```

**Step 3: Commit**

```bash
git add src/pages/Jukebox.tsx
git commit -m "feat: use findSongByCode in Jukebox handleCodeEntry"
```

---

### Task 13: Final Testing and Cleanup

**Step 1: Run the dev server**

```bash
npm run dev
```

**Step 2: Manual testing checklist**

- [ ] Letter buttons A-K work and display in LED
- [ ] Number buttons 0-6 work and display in LED
- [ ] CLR button clears display
- [ ] OK button with valid code (A01-K06) selects song
- [ ] OK button with invalid code flashes red
- [ ] Up/Down buttons flip rolodex pages
- [ ] Keyboard shortcuts work (A-K, 0-6, Backspace, Enter, arrows)
- [ ] Song cards show letter codes (A01, A02, etc.)
- [ ] Click sound plays on button press

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete ButtonPanel implementation"
```

---

## Summary

This plan implements the vintage button panel in 13 tasks:

1. Update song codes to A01-K06 format
2. Make Rolodex accept controlled page state
3. Remove navigation buttons from Rolodex
4. Create LED display component
5. Create VintageButton component
6. Create main ButtonPanel component
7. Add keyboard support
8. Add click sounds
9. Export and add slot to JukeboxShell
10. Integrate in Jukebox.tsx
11. Create song lookup utility
12. Wire up the lookup
13. Final testing
