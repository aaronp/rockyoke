# Responsive Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add responsive three-column layout with vintage gig poster (left), jukebox (center), and signup queue (right). Stack vertically on narrow screens.

**Architecture:** CSS Grid layout in Jukebox.tsx with two new components (EventPoster, LineupPanel). Wide screens use `grid-cols-[280px_1fr_280px]`, narrow screens stack vertically. EventPoster renders as full poster or compact banner based on variant prop.

**Tech Stack:** React, TypeScript, Tailwind CSS

---

### Task 1: Create EventPoster Component

**Files:**
- Create: `src/components/EventPoster.tsx`

**Step 1: Create the component file with poster variant**

```tsx
// src/components/EventPoster.tsx

type EventPosterProps = {
  eventName: string;
  venue: string;
  date: string;
  priceAdvance: string;
  priceDoor: string;
  variant: "poster" | "banner";
  className?: string;
};

export function EventPoster({
  eventName,
  venue,
  date,
  priceAdvance,
  priceDoor,
  variant,
  className = "",
}: EventPosterProps) {
  if (variant === "banner") {
    return (
      <div
        className={`bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-4 py-3 text-center ${className}`}
      >
        <p className="text-sm font-bold uppercase tracking-wider text-amber-100">
          <span className="text-amber-300">{eventName}</span>
          <span className="mx-2 text-amber-600">•</span>
          {venue}
          <span className="mx-2 text-amber-600">•</span>
          {date}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex h-full flex-col items-center justify-center rounded-lg p-6 ${className}`}
      style={{
        background: `
          linear-gradient(135deg, rgba(60, 20, 10, 0.95) 0%, rgba(40, 15, 8, 0.98) 50%, rgba(30, 10, 5, 0.95) 100%),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          )
        `,
        boxShadow: "inset 0 0 60px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Decorative top border */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-amber-500">★</span>
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        <span className="text-amber-500">★</span>
      </div>

      {/* Event name */}
      <h1
        className="mb-1 text-center font-bold uppercase tracking-widest text-amber-100"
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        {eventName.split(" ")[0]}
      </h1>
      {eventName.split(" ").length > 1 && (
        <h2
          className="mb-6 text-center font-bold uppercase tracking-wider text-amber-200"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
          }}
        >
          {eventName.split(" ").slice(1).join(" ")}
        </h2>
      )}

      {/* Divider */}
      <div className="mb-6 h-px w-3/4 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

      {/* Venue */}
      <p
        className="mb-2 text-center font-semibold uppercase tracking-wide text-amber-100"
        style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)" }}
      >
        {venue}
      </p>

      {/* Date */}
      <p
        className="mb-6 text-center font-bold uppercase tracking-widest text-amber-300"
        style={{ fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
      >
        {date}
      </p>

      {/* Divider */}
      <div className="mb-6 h-px w-1/2 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

      {/* Pricing */}
      <div className="text-center">
        <p className="text-sm uppercase tracking-wide text-amber-400">
          {priceAdvance} advance
        </p>
        <p className="text-sm uppercase tracking-wide text-amber-400">
          {priceDoor} on the door
        </p>
      </div>

      {/* Decorative bottom border */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
        <span className="text-xs text-amber-600">★</span>
        <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
      </div>
    </div>
  );
}
```

**Step 2: Verify file was created**

Run: `ls -la src/components/EventPoster.tsx`
Expected: File exists

**Step 3: Commit**

```bash
git add src/components/EventPoster.tsx
git commit -m "feat: add EventPoster component with poster and banner variants"
```

---

### Task 2: Create LineupPanel Component

**Files:**
- Create: `src/components/LineupPanel.tsx`

**Step 1: Create the component file**

```tsx
// src/components/LineupPanel.tsx
import type { QueueEntry } from "@/types/jukebox";

type LineupPanelProps = {
  queue: QueueEntry[];
  variant: "panel" | "section";
  className?: string;
};

export function LineupPanel({
  queue,
  variant,
  className = "",
}: LineupPanelProps) {
  const isPanel = variant === "panel";
  const title = isPanel ? "Tonight's Lineup" : "Up Next";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-neutral-900/80 ${
        isPanel ? "h-full" : ""
      } ${className}`}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-amber-900/30 bg-neutral-900/90 px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-500">★</span>
          <h2 className="text-center text-sm font-bold uppercase tracking-wider text-amber-400">
            {title}
          </h2>
          <span className="text-amber-500">★</span>
        </div>
        {queue.length > 0 && (
          <p className="mt-1 text-center text-xs text-amber-600">
            {queue.length} {queue.length === 1 ? "singer" : "singers"} queued
          </p>
        )}
      </div>

      {/* Queue list */}
      <div className={`flex-1 overflow-y-auto p-3 ${isPanel ? "" : "max-h-64"}`}>
        {queue.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <p className="mb-2 text-amber-200">No singers yet</p>
            <p className="text-sm text-amber-500">Be first!</p>
            <span className="mt-2 text-2xl">👈</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {queue.map((entry, index) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded bg-neutral-800/50 px-3 py-2"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-900/50 font-mono text-xs font-bold text-amber-400">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-amber-100">
                    {entry.name}
                  </p>
                  <p className="truncate text-xs text-amber-400">
                    {entry.song.title}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify file was created**

Run: `ls -la src/components/LineupPanel.tsx`
Expected: File exists

**Step 3: Commit**

```bash
git add src/components/LineupPanel.tsx
git commit -m "feat: add LineupPanel component for queue display"
```

---

### Task 3: Update Jukebox Page with Grid Layout

**Files:**
- Modify: `src/pages/Jukebox.tsx`

**Step 1: Add imports for new components**

Add at top of file after existing imports:

```tsx
import { EventPoster } from "@/components/EventPoster";
import { LineupPanel } from "@/components/LineupPanel";
```

**Step 2: Replace the return statement with grid layout**

Replace the entire return statement (from `return (` to the closing `);`) with:

```tsx
  return (
    <div
      className="relative min-h-screen text-neutral-100 overflow-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-neutral-950/80" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Narrow screens: Banner at top */}
        <div className="lg:hidden">
          <EventPoster
            eventName="Rockyoke Night"
            venue="The Mechanics"
            date="2nd May"
            priceAdvance="£12"
            priceDoor="£15"
            variant="banner"
          />
        </div>

        {/* Grid layout */}
        <div className="grid min-h-screen grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[280px_1fr_280px] lg:items-center lg:py-2">
          {/* Wide screens: Poster on left */}
          <div className="hidden lg:block lg:self-center">
            <EventPoster
              eventName="Rockyoke Night"
              venue="The Mechanics"
              date="2nd May"
              priceAdvance="£12"
              priceDoor="£15"
              variant="poster"
            />
          </div>

          {/* Jukebox (center) */}
          <div className="flex items-center justify-center">
            <JukeboxShell
              recordPlayer={
                <Wurlitzer
                  triggerPlay={shouldTriggerPlay}
                  triggerReset={shouldTriggerReset}
                  onPlayComplete={previewPlaying ? undefined : state.onPlayComplete}
                  onReset={state.reset}
                  onNeedleDown={previewPlaying ? handleNeedleDown : undefined}
                  showControls={state.wizardState === "idle"}
                />
              }
              songRolodex={
                <Rolodex
                  onSelectSong={(song) => {
                    state.selectSong(song);
                    setCodeInput(song.number);
                  }}
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
                  input={codeInput}
                  onInputChange={setCodeInput}
                  displayState={codeDisplayState}
                  onDisplayStateChange={setCodeDisplayState}
                />
              }
              songQueue={
                <SignUpWizard
                  wizardState={state.wizardState}
                  selectedSong={state.selectedSong}
                  lastEntry={state.lastEntry}
                  onStartSignUp={state.startSignUp}
                  onSubmitName={state.submitName}
                  onSubmitPayment={state.submitPayment}
                  onReset={state.reset}
                  onPreviewStart={handlePreviewStart}
                  onPreviewEnd={handlePreviewEnd}
                  triggerPlayAudio={needleDown}
                  queue={state.queue}
                  codeInput={codeInput}
                  codeDisplayState={codeDisplayState}
                />
              }
            />
          </div>

          {/* Queue panel (right on wide, bottom on narrow) */}
          <div className="lg:self-center">
            <LineupPanel
              queue={state.queue}
              variant="panel"
              className="hidden lg:flex lg:h-[600px]"
            />
            <LineupPanel
              queue={state.queue}
              variant="section"
              className="lg:hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
```

**Step 3: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 4: Commit**

```bash
git add src/pages/Jukebox.tsx
git commit -m "feat: add responsive grid layout with poster and queue panels"
```

---

### Task 4: Visual Testing and Polish

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test wide screen layout**

- Open browser at http://localhost:5173/rockyoke/
- Resize window to > 1024px width
- Verify: Poster on left, jukebox center, queue on right
- Verify: All three columns are vertically centered

**Step 3: Test narrow screen layout**

- Resize window to < 1024px width
- Verify: Banner appears at top
- Verify: Jukebox below banner
- Verify: Queue panel at bottom
- Verify: Page scrolls vertically if needed

**Step 4: Test empty queue state**

- Verify: Queue panel shows "No singers yet - be first!" with arrow

**Step 5: Test queue with entries**

- Sign up for a song using the jukebox
- Verify: Entry appears in queue panel
- Verify: Entry shows number, name, and song title

**Step 6: Final commit if any tweaks needed**

```bash
git add -A
git commit -m "polish: responsive layout adjustments"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | EventPoster component | `src/components/EventPoster.tsx` |
| 2 | LineupPanel component | `src/components/LineupPanel.tsx` |
| 3 | Grid layout integration | `src/pages/Jukebox.tsx` |
| 4 | Visual testing | - |
