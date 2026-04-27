# Song Request Tracking Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users select songs from a checklist, persist choices in localStorage, and silently POST snapshots to a Google Sheet via Google Forms so the organiser can see who wants to sing what.

**Architecture:** Song data extracted to shared module. `useTickets` extended with `selectedSongs` and `clientRequestId`. A thin submission hook debounces POSTs to Google Forms. SongChecklist component used in both the TicketModal and a standalone modal accessible from a header banner.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui Dialog, Google Forms POST (no-cors), localStorage, navigator.sendBeacon

**Spec:** `docs/superpowers/specs/2026-04-27-song-choice-tracking-design.md`

**Note:** This project has no testing framework. Tasks skip TDD and focus on implementation + manual verification. Each task ends with a type-check (`npx tsc --noEmit`) and a commit.

---

## Chunk 1: Data Layer

### Task 1: Extract song data to `src/data/songs.ts`

Move the song catalog, code utilities, and lookup map out of Rolodex.tsx into a shared data module. Rolodex.tsx then imports from this module.

**Files:**
- Create: `src/data/songs.ts`
- Modify: `src/components/jukebox/Rolodex.tsx`

- [ ] **Step 1: Create `src/data/songs.ts`**

Copy from `Rolodex.tsx` into the new file:
- `InternalSong` type
- `SONGS` array (the full song catalog)
- `songCode()` function
- `SONG_BY_CODE` lookup map
- `findSongByCode()` function
- `getTotalPages()` function

```typescript
// src/data/songs.ts
import type { Song } from "@/types/jukebox";

export type InternalSong = {
  no: number;
  title: string;
  artist: string;
  year: number;
  isRequest?: boolean;
};

export const SONGS: InternalSong[] = [
  // ... full array copied from Rolodex.tsx ...
];

/** Compute song code from absolute index in the master SONGS list */
export function songCode(absoluteIndex: number): string {
  const pageIdx = Math.floor(absoluteIndex / 6);
  const posInPage = absoluteIndex % 6;
  const letter = String.fromCharCode(65 + pageIdx);
  return `${letter}${String(posInPage + 1).padStart(2, '0')}`;
}

// Build a single lookup map from code -> Song
export const SONG_BY_CODE: Record<string, Song> = {};
SONGS.forEach((internal, absoluteIndex) => {
  const code = songCode(absoluteIndex);
  SONG_BY_CODE[code] = {
    id: code,
    number: code,
    title: internal.title,
    artist: internal.artist,
    year: internal.year,
    isRequest: internal.isRequest,
  };
});

export function findSongByCode(code: string): Song | null {
  return SONG_BY_CODE[code.toUpperCase()] ?? null;
}

export function getTotalPages(variant: "large" | "small" = "large"): number {
  const songsPerRow = variant === "small" ? 2 : 3;
  const perPage = songsPerRow * 2;
  return Math.ceil(SONGS.length / perPage);
}
```

- [ ] **Step 2: Update `Rolodex.tsx` to import from `src/data/songs.ts`**

Remove the `SONGS` array, `InternalSong` type, `songCode()`, `SONG_BY_CODE`, `findSongByCode()`, `getTotalPages()`, and `toSong()` from Rolodex.tsx. Replace with imports:

```typescript
import { SONGS, songCode, SONG_BY_CODE, getTotalPages } from "@/data/songs";
import type { InternalSong } from "@/data/songs";
```

Remove the `toSong` function. Replace its usage in `handleSongClick`:

```typescript
// Before:
onSelectSong(toSong(entry.absoluteIndex));

// After:
onSelectSong(SONG_BY_CODE[songCode(entry.absoluteIndex)]);
```

Remove the re-exports of `findSongByCode` and `getTotalPages` from Rolodex.tsx.

- [ ] **Step 3: Update imports in other files**

Update `src/pages/Jukebox.tsx`:
```typescript
// Before:
import { findSongByCode, getTotalPages } from "@/components/jukebox/Rolodex";

// After:
import { findSongByCode, getTotalPages } from "@/data/songs";
```

Check for any other files importing from Rolodex (grep for `from.*Rolodex`).

- [ ] **Step 4: Type-check and verify**

Run: `npx tsc --noEmit`
Expected: No new errors (pre-existing ones are OK).

Run: `npm run dev` and manually verify the jukebox still works (browse songs, click cards, type codes).

- [ ] **Step 5: Commit**

```bash
git add src/data/songs.ts src/components/jukebox/Rolodex.tsx src/pages/Jukebox.tsx
git commit -m "refactor: extract song data to src/data/songs.ts"
```

---

### Task 2: Add `SelectedSong` type to `src/types/jukebox.ts`

**Files:**
- Modify: `src/types/jukebox.ts`

- [ ] **Step 1: Add the SelectedSong discriminated union**

Append to `src/types/jukebox.ts`:

```typescript
export type SelectedSong =
  | {
      kind: "catalog";
      number: string;   // e.g. "A01"
      title: string;
      artist: string;
    }
  | {
      kind: "custom";
      number: "L01";
      title: string;
      artist?: string;
    };
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/types/jukebox.ts
git commit -m "feat: add SelectedSong discriminated union type"
```

---

### Task 3: Extend `useTickets` with `selectedSongs` and `clientRequestId`

**Files:**
- Modify: `src/hooks/useTickets.ts`

- [ ] **Step 1: Update `TicketStorage` type and `getStoredTickets` defaults**

```typescript
import type { SelectedSong } from "@/types/jukebox";

type TicketStorage = {
  tickets: TicketData[];
  pendingConfirmation: boolean;
  clientRequestId: string;
  selectedSongs: SelectedSong[];
};

function generateClientRequestId(): string {
  return crypto.randomUUID();
}

function getStoredTickets(): TicketStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        tickets: parsed.tickets ?? [],
        pendingConfirmation: parsed.pendingConfirmation ?? false,
        clientRequestId: parsed.clientRequestId ?? generateClientRequestId(),
        selectedSongs: parsed.selectedSongs ?? [],
      };
    }
  } catch {
    // localStorage unavailable or corrupted
  }
  return {
    tickets: [],
    pendingConfirmation: false,
    clientRequestId: generateClientRequestId(),
    selectedSongs: [],
  };
}
```

- [ ] **Step 2: Add song selection state and actions to the hook**

Add state for `selectedSongs` and `clientRequestId`. Add `toggleSong`, `removeSong`, and `setSongs` callbacks. Ensure `clientRequestId` is persisted on first read if absent.

```typescript
export function useTickets() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<SelectedSong[]>([]);
  const [clientRequestId, setClientRequestId] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = getStoredTickets();
    setTickets(stored.tickets);
    setPendingConfirmation(stored.pendingConfirmation);
    setSelectedSongs(stored.selectedSongs);
    setClientRequestId(stored.clientRequestId);
    // Persist clientRequestId if it was just generated
    if (!stored.clientRequestId || stored.clientRequestId !== getStoredTickets().clientRequestId) {
      saveTickets(stored);
    }
  }, []);

  // Helper to save full state
  const saveCurrentState = useCallback((overrides: Partial<TicketStorage> = {}) => {
    const current = getStoredTickets();
    saveTickets({ ...current, ...overrides });
  }, []);

  const toggleSong = useCallback((song: SelectedSong) => {
    setSelectedSongs((prev) => {
      const exists = prev.some((s) => s.number === song.number);
      const updated = exists
        ? prev.filter((s) => s.number !== song.number)
        : [...prev, song];
      saveCurrentState({ selectedSongs: updated });
      return updated;
    });
  }, [saveCurrentState]);

  const removeSong = useCallback((songNumber: string) => {
    setSelectedSongs((prev) => {
      const updated = prev.filter((s) => s.number !== songNumber);
      saveCurrentState({ selectedSongs: updated });
      return updated;
    });
  }, [saveCurrentState]);

  // ... existing addTicket, clearPendingConfirmation unchanged ...

  return {
    // ... existing returns ...
    selectedSongs,
    clientRequestId,
    toggleSong,
    removeSong,
  };
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useTickets.ts
git commit -m "feat: extend useTickets with selectedSongs and clientRequestId"
```

---

### Task 4: Create song submission logic (`src/lib/song-submission.ts`)

Pure functions for serialization, hashing, and submission. No React dependencies -- testable independently.

**Files:**
- Create: `src/lib/song-submission.ts`

- [ ] **Step 1: Create the module**

```typescript
// src/lib/song-submission.ts
import type { SelectedSong } from "@/types/jukebox";

// Google Form configuration
// Replace these with actual values after creating the form
const GOOGLE_FORM_RESPONSE_URL = "https://docs.google.com/forms/d/e/FORM_ID/formResponse";
const FIELD_CLIENT_ID = "entry.REPLACE_ME";
const FIELD_ORDER_IDS = "entry.REPLACE_ME";
const FIELD_SONGS = "entry.REPLACE_ME";
const FIELD_TIMESTAMP = "entry.REPLACE_ME";

export function serializeSongs(songs: SelectedSong[]): string {
  return songs
    .map((s) => {
      const artist = s.artist ?? "Unknown";
      return `${s.number} ${s.title} - ${artist}`;
    })
    .join(", ");
}

export function computeSnapshotHash(
  clientRequestId: string,
  orderIds: string,
  songsSerialized: string
): string {
  // Simple string hash -- not cryptographic, just for dedup
  const input = `${clientRequestId}|${orderIds}|${songsSerialized}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}

export function buildFormParams(
  clientRequestId: string,
  orderIds: string,
  songsSerialized: string
): URLSearchParams {
  return new URLSearchParams({
    [FIELD_CLIENT_ID]: clientRequestId,
    [FIELD_ORDER_IDS]: orderIds,
    [FIELD_SONGS]: songsSerialized,
    [FIELD_TIMESTAMP]: new Date().toISOString(),
  });
}

export function submitSnapshot(params: URLSearchParams): void {
  fetch(GOOGLE_FORM_RESPONSE_URL, {
    method: "POST",
    mode: "no-cors",
    body: params,
  });
}

export function submitSnapshotBeacon(params: URLSearchParams): void {
  navigator.sendBeacon(GOOGLE_FORM_RESPONSE_URL, params);
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/lib/song-submission.ts
git commit -m "feat: add song submission serialization and POST logic"
```

---

### Task 5: Create `useSongSubmission` hook

Thin hook that watches `selectedSongs` and `tickets`, debounces 4s, POSTs via the submission lib, and registers a sendBeacon on beforeunload.

**Files:**
- Create: `src/hooks/useSongSubmission.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useSongSubmission.ts
import { useEffect, useRef } from "react";
import type { SelectedSong } from "@/types/jukebox";
import {
  serializeSongs,
  computeSnapshotHash,
  buildFormParams,
  submitSnapshot,
  submitSnapshotBeacon,
} from "@/lib/song-submission";

const DEBOUNCE_MS = 4000;

type UseSongSubmissionArgs = {
  clientRequestId: string;
  ticketIds: string[];
  selectedSongs: SelectedSong[];
};

export function useSongSubmission({
  clientRequestId,
  ticketIds,
  selectedSongs,
}: UseSongSubmissionArgs) {
  const lastHashRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestParamsRef = useRef<URLSearchParams | null>(null);

  useEffect(() => {
    // Don't submit until clientRequestId is initialized
    if (!clientRequestId) return;

    const orderIds = ticketIds.join(",");
    const songsSerialized = serializeSongs(selectedSongs);
    const hash = computeSnapshotHash(clientRequestId, orderIds, songsSerialized);

    // Skip if nothing changed
    if (hash === lastHashRef.current) return;

    const params = buildFormParams(clientRequestId, orderIds, songsSerialized);
    latestParamsRef.current = params;

    // Clear previous debounce
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      submitSnapshot(params);
      lastHashRef.current = hash;
      latestParamsRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [clientRequestId, ticketIds, selectedSongs]);

  // sendBeacon on beforeunload if there's a pending submission
  useEffect(() => {
    const handleUnload = () => {
      if (latestParamsRef.current) {
        submitSnapshotBeacon(latestParamsRef.current);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSongSubmission.ts
git commit -m "feat: add useSongSubmission hook with debounce and sendBeacon"
```

---

## Chunk 2: UI Components

### Task 6: Create `SongChecklist` component

A scrollable, filterable checklist of all songs with checkboxes. Used in both the TicketModal and a standalone modal.

**Files:**
- Create: `src/components/SongChecklist.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/SongChecklist.tsx
import { useState, useMemo } from "react";
import { SONGS, songCode } from "@/data/songs";
import type { SelectedSong } from "@/types/jukebox";

type SongChecklistProps = {
  selectedSongs: SelectedSong[];
  onToggleSong: (song: SelectedSong) => void;
};

export function SongChecklist({ selectedSongs, onToggleSong }: SongChecklistProps) {
  const [filter, setFilter] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");

  const selectedNumbers = useMemo(
    () => new Set(selectedSongs.map((s) => s.number)),
    [selectedSongs]
  );

  const filteredSongs = useMemo(() => {
    const q = filter.toLowerCase();
    if (!q) return SONGS;
    return SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
    );
  }, [filter]);

  const handleToggleCatalogSong = (absoluteIndex: number) => {
    const song = SONGS[absoluteIndex];
    const code = songCode(absoluteIndex);

    if (song.isRequest) {
      // Handle custom request toggle
      if (selectedNumbers.has("L01")) {
        onToggleSong({ kind: "custom", number: "L01", title: customTitle || "Request a Song" });
      } else {
        // Don't add until they've typed something -- just check the box, they fill in details
        onToggleSong({ kind: "custom", number: "L01", title: customTitle || "Request a Song" });
      }
      return;
    }

    onToggleSong({
      kind: "catalog",
      number: code,
      title: song.title,
      artist: song.artist,
    });
  };

  // Update custom request details when text changes
  const handleCustomTitleChange = (title: string) => {
    setCustomTitle(title);
    if (selectedNumbers.has("L01")) {
      // Update the existing custom selection
      onToggleSong({ kind: "custom", number: "L01", title: title || "Request a Song", artist: customArtist || undefined });
      // Re-add with updated title
      onToggleSong({ kind: "custom", number: "L01", title: title || "Request a Song", artist: customArtist || undefined });
    }
  };

  const handleCustomArtistChange = (artist: string) => {
    setCustomArtist(artist);
    if (selectedNumbers.has("L01")) {
      onToggleSong({ kind: "custom", number: "L01", title: customTitle || "Request a Song", artist: artist || undefined });
      onToggleSong({ kind: "custom", number: "L01", title: customTitle || "Request a Song", artist: artist || undefined });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Search filter */}
      <input
        type="text"
        placeholder="Search songs..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded border border-amber-700/50 bg-neutral-900/80 px-3 py-2 text-sm text-amber-100 placeholder-amber-700 focus:border-amber-500 focus:outline-none"
      />

      {/* Song list */}
      <div className="max-h-60 overflow-y-auto rounded border border-amber-900/30 bg-neutral-950/50">
        {filteredSongs.map((song, _filterIdx) => {
          // Get the real absolute index for code computation
          const absoluteIndex = SONGS.indexOf(song);
          const code = songCode(absoluteIndex);
          const isSelected = selectedNumbers.has(code);

          return (
            <label
              key={song.no}
              className={`flex cursor-pointer items-center gap-2 border-b border-amber-900/20 px-3 py-2 text-sm transition-colors last:border-b-0 ${
                isSelected
                  ? "bg-amber-900/30 text-amber-100"
                  : "text-amber-300 hover:bg-amber-900/15"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleCatalogSong(absoluteIndex)}
                className="accent-amber-500"
              />
              <span className="font-mono text-xs text-amber-600">{code}</span>
              <span className="flex-1 truncate font-medium">
                {song.isRequest ? "Request a Song" : song.title}
              </span>
              <span className="truncate text-xs text-amber-500">
                {song.isRequest ? "Your choice!" : song.artist}
              </span>
            </label>
          );
        })}
      </div>

      {/* Custom request fields (shown when L01 is selected) */}
      {selectedNumbers.has("L01") && (
        <div className="flex flex-col gap-1.5 rounded border border-rose-800/40 bg-rose-950/30 p-3">
          <p className="text-xs font-semibold uppercase text-rose-300">Your song request</p>
          <input
            type="text"
            placeholder="Song title"
            value={customTitle}
            onChange={(e) => handleCustomTitleChange(e.target.value)}
            className="w-full rounded border border-rose-700/50 bg-neutral-900/80 px-2 py-1.5 text-sm text-amber-100 placeholder-rose-700 focus:border-rose-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Artist (optional)"
            value={customArtist}
            onChange={(e) => handleCustomArtistChange(e.target.value)}
            className="w-full rounded border border-rose-700/50 bg-neutral-900/80 px-2 py-1.5 text-sm text-amber-100 placeholder-rose-700 focus:border-rose-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
```

Note: The custom request toggle/update logic above is a rough sketch. The implementer should refine the update mechanism -- likely by having `onToggleSong` handle "update in place" for custom songs (remove old L01, add new L01) rather than the double-toggle approach above. A simpler approach: make `toggleSong` in `useTickets` do a remove-then-add when the number matches and `kind === "custom"`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/SongChecklist.tsx
git commit -m "feat: add SongChecklist component with search and custom requests"
```

---

### Task 7: Update `TicketModal` with song checklist and disclaimer

**Files:**
- Modify: `src/components/TicketModal.tsx`

- [ ] **Step 1: Add props for selectedSongs and onToggleSong**

Add to `TicketModalProps`:
```typescript
selectedSongs: SelectedSong[];
onToggleSong: (song: SelectedSong) => void;
```

Import `SongChecklist` and `SelectedSong`.

- [ ] **Step 2: Add checklist and disclaimer to the modal body**

Insert between the price info and the "Buy Tickets" button:

```tsx
{/* Song selection */}
<div className="mb-4 w-full">
  <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-amber-400">
    Pick your songs
  </p>
  <SongChecklist
    selectedSongs={selectedSongs}
    onToggleSong={onToggleSong}
  />
  <p className="mt-2 text-center text-[10px] italic text-amber-600">
    Song choices are requests only and not guaranteed. The band will do their best to accommodate your preferences on the night.
  </p>
</div>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/TicketModal.tsx
git commit -m "feat: add song checklist and disclaimer to TicketModal"
```

---

### Task 8: Create `SongChecklistModal` (standalone)

A standalone modal wrapping `SongChecklist`, opened from the header banner. Does not include event details or buy button -- just the checklist.

**Files:**
- Create: `src/components/SongChecklistModal.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/SongChecklistModal.tsx
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SongChecklist } from "@/components/SongChecklist";
import type { SelectedSong } from "@/types/jukebox";

type SongChecklistModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSongs: SelectedSong[];
  onToggleSong: (song: SelectedSong) => void;
};

export function SongChecklistModal({
  open,
  onOpenChange,
  selectedSongs,
  onToggleSong,
}: SongChecklistModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-amber-900/50 p-0 sm:max-w-md"
        style={{
          background:
            "linear-gradient(135deg, rgba(60, 20, 10, 0.98) 0%, rgba(40, 15, 8, 0.99) 50%, rgba(30, 10, 5, 0.98) 100%)",
          boxShadow:
            "inset 0 0 60px rgba(0, 0, 0, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.8)",
        }}
      >
        <DialogTitle className="sr-only">Edit Song Requests</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which songs you would like to request
        </DialogDescription>

        <div className="flex flex-col p-6">
          <h2 className="mb-4 text-center text-lg font-bold uppercase tracking-wider text-amber-100">
            Your Song Requests
          </h2>
          <SongChecklist
            selectedSongs={selectedSongs}
            onToggleSong={onToggleSong}
          />
          <p className="mt-3 text-center text-[10px] italic text-amber-600">
            Song choices are requests only and not guaranteed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/SongChecklistModal.tsx
git commit -m "feat: add standalone SongChecklistModal"
```

---

### Task 9: Create `SongRequestBanner` component

Header banner showing current song selections. Clickable to open the SongChecklistModal.

**Files:**
- Create: `src/components/SongRequestBanner.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/SongRequestBanner.tsx
import type { SelectedSong } from "@/types/jukebox";

type SongRequestBannerProps = {
  selectedSongs: SelectedSong[];
  onClick: () => void;
};

export function SongRequestBanner({ selectedSongs, onClick }: SongRequestBannerProps) {
  if (selectedSongs.length === 0) return null;

  const songTitles = selectedSongs.map((s) => s.title).join(", ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-amber-900/60 px-4 py-2 text-center text-sm text-amber-200 transition-colors hover:bg-amber-900/80"
    >
      <span className="font-semibold text-amber-400">Your song requests: </span>
      <span className="italic">{songTitles}</span>
      <span className="ml-2 text-xs text-amber-500">(tap to edit)</span>
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/SongRequestBanner.tsx
git commit -m "feat: add SongRequestBanner header component"
```

---

## Chunk 3: Integration

### Task 10: Wire everything together in `Jukebox.tsx`

Connect the new components and hooks. Simplify the song queue slot. Remove wizard-related state that's no longer needed.

**Files:**
- Modify: `src/pages/Jukebox.tsx`

- [ ] **Step 1: Add imports**

```typescript
import { SongRequestBanner } from "@/components/SongRequestBanner";
import { SongChecklistModal } from "@/components/SongChecklistModal";
import { useSongSubmission } from "@/hooks/useSongSubmission";
```

- [ ] **Step 2: Add state and hook calls**

Add to the component body:

```typescript
const [songChecklistOpen, setSongChecklistOpen] = useState(false);

// Song submission to Google Forms
useSongSubmission({
  clientRequestId,
  ticketIds,
  selectedSongs,
});
```

Where `clientRequestId`, `ticketIds`, and `selectedSongs` come from the existing `useTickets()` call (which now returns these).

- [ ] **Step 3: Add SongRequestBanner to the layout**

Add the banner just above the jukebox grid, inside `<div className="relative z-10 min-h-screen">`, after the mobile banner and before the grid:

```tsx
{/* Song request banner */}
<SongRequestBanner
  selectedSongs={selectedSongs}
  onClick={() => setSongChecklistOpen(true)}
/>
```

- [ ] **Step 4: Add SongChecklistModal**

Add alongside the other modals at the bottom of the component:

```tsx
<SongChecklistModal
  open={songChecklistOpen}
  onOpenChange={setSongChecklistOpen}
  selectedSongs={selectedSongs}
  onToggleSong={toggleSong}
/>
```

- [ ] **Step 5: Pass selectedSongs and onToggleSong to TicketModal**

Update the `<TicketModal>` JSX to include the new props:

```tsx
<TicketModal
  open={ticketModalOpen}
  onOpenChange={setTicketModalOpen}
  {...EVENT_DETAILS}
  ticketsOwned={ticketCount}
  ticketsRemaining={ticketsRemaining}
  selectedSongs={selectedSongs}
  onToggleSong={toggleSong}
/>
```

- [ ] **Step 6: Pre-check jukebox-selected song**

When a song is selected on the jukebox (via Rolodex click or code entry), auto-add it to `selectedSongs` if not already there. Modify the `onSelectSong` handler for the Rolodex:

```tsx
<Rolodex
  onSelectSong={(song) => {
    state.selectSong(song);
    setCodeInput(song.number);
    // Auto-add to song requests if not already selected
    if (!selectedSongs.some((s) => s.number === song.number)) {
      toggleSong({
        kind: song.isRequest ? "custom" : "catalog",
        number: song.number,
        title: song.title,
        artist: song.artist,
      } as SelectedSong);
    }
  }}
  // ...
/>
```

- [ ] **Step 7: Simplify the song queue slot**

Replace the complex `SignUpWizard` usage with a simplified view. The song queue slot now shows:
- LED display with current code input
- Song selections summary or "Pick songs to get started!"
- "Pick Songs" button
- "Buy Tickets" button (if no tickets)

This can be done by simplifying `SignUpWizard` or replacing it inline. The exact approach depends on how much of the existing SignUpWizard is still useful -- the implementer should assess and simplify accordingly. The key requirement: remove the enter-name wizard flow, keep the LED display, add pick-songs and buy-tickets buttons.

- [ ] **Step 8: Remove unused state**

Clean up state variables and imports that are no longer needed now that the wizard flow is gone:
- `previewPlaying`, `needleDown`, `previewingSong` -- keep if song preview still works
- `handlePreviewStart`, `handlePreviewEnd`, `handleNeedleDown` -- keep if preview still works
- The `state.startSignUp`, `state.submitName`, `state.submitPayment` -- no longer called from UI
- `ticketsRemaining` calculation -- may still be useful for display

The implementer should remove dead code but be careful not to break the Wurlitzer preview functionality.

- [ ] **Step 9: Type-check and verify**

Run: `npx tsc --noEmit`

Run: `npm run dev` and manually verify:
1. Song request banner appears when songs are selected
2. Clicking banner opens the SongChecklistModal
3. TicketModal shows the song checklist with disclaimer
4. Selecting a song on the jukebox adds it to the checklist
5. Song selections persist across page refreshes (localStorage)

- [ ] **Step 10: Commit**

```bash
git add src/pages/Jukebox.tsx
git commit -m "feat: integrate song request tracking into Jukebox page"
```

---

### Task 11: Update event date in mobile banner

The `EventPoster` banner component shows the event date. Verify it picks up the date from `EVENT_DETAILS` (already changed to "20th June" in a prior commit). If the mobile banner has a hardcoded date, update it.

**Files:**
- Check: `src/components/EventPoster.tsx`

- [ ] **Step 1: Verify the date is passed through**

Read `EventPoster.tsx` and confirm the `date` prop is used in the banner variant. If hardcoded anywhere, update to use the prop.

- [ ] **Step 2: Commit if changes needed**

```bash
git add src/components/EventPoster.tsx
git commit -m "fix: ensure mobile banner uses date prop"
```

---

### Task 12: Final cleanup and verification

**Files:**
- Various

- [ ] **Step 1: Remove dead code**

Check for unused imports, unreferenced components, or hooks that are no longer called. Key candidates:
- `useQueue` hook -- if no longer used after wizard simplification
- `QueueDisplay` component -- if queue display is removed
- `QueueEntry` type -- if no longer used
- Parts of `useJukeboxState` that handled the wizard flow

Only remove code that is genuinely unreferenced. Keep the `WizardState` type and `useJukeboxState` if they're still used for the Wurlitzer preview flow.

- [ ] **Step 2: Full type-check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev` and verify:
1. Browse songs on jukebox (Rolodex, buttons, code entry)
2. Click a song card -- it gets added to song requests
3. Banner appears showing the song request
4. Click banner -- SongChecklistModal opens, can add/remove songs
5. Open TicketModal -- see song checklist with pre-checked songs + disclaimer
6. Refresh page -- song selections persist
7. Desktop and mobile layouts work
8. Song preview (Wurlitzer) still works

- [ ] **Step 5: Commit any remaining cleanup**

```bash
git add -A
git commit -m "chore: remove dead code from wizard flow simplification"
```
