# Responsive Layout Design

## Overview

Add a responsive three-column layout with a vintage gig poster on the left, the jukebox in the center, and a signup queue on the right. On narrow screens, stack vertically: banner, jukebox, queue.

## Layout Structure

### Wide Screens (≥1024px)

```
┌─────────────┬───────────────────┬─────────────┐
│   POSTER    │     JUKEBOX       │    QUEUE    │
│  ~280px     │   flex-1          │   ~280px    │
└─────────────┴───────────────────┴─────────────┘
```

- CSS Grid with `grid-template-columns: 280px 1fr 280px`
- Jukebox centered, fills available space
- Side panels have fixed width, vertically centered with jukebox

### Narrow Screens (<1024px)

```
┌─────────────────────────────────┐
│  BANNER (compact event info)    │
├─────────────────────────────────┤
│          JUKEBOX                │
├─────────────────────────────────┤
│          QUEUE                  │
└─────────────────────────────────┘
```

- Single column, scrollable
- Banner is compact horizontal strip
- Queue section full width

## Components

### EventPoster

Vintage gig poster style panel for event details.

**Props:**
- `eventName`: string (e.g., "Rockyoke Night")
- `venue`: string (e.g., "The Mechanics")
- `date`: string (e.g., "2nd May")
- `priceAdvance`: string (e.g., "£12")
- `priceDoor`: string (e.g., "£15")
- `variant`: "poster" | "banner" (responsive switching)

**Visual style:**
- Dark burgundy/brown background with worn paper texture (CSS gradients)
- Cream/off-white text
- Bold stacked typography
- Decorative stars/dividers

**Wide (poster) layout:**
```
┌─────────────────────────┐
│     ★ ROCKYOKE ★        │
│        NIGHT            │
│                         │
│    THE MECHANICS        │
│      2ND MAY            │
│                         │
│   £12 ADV / £15 DOOR    │
└─────────────────────────┘
```

**Narrow (banner) layout:**
```
┌──────────────────────────────────────────────────┐
│  ROCKYOKE NIGHT  •  The Mechanics  •  2nd May    │
└──────────────────────────────────────────────────┘
```

### LineupPanel

Displays the signup queue with enhanced styling.

**Props:**
- `queue`: QueueEntry[] (from existing types)
- `variant`: "panel" | "section" (responsive switching)

**Visual style:**
- Dark semi-transparent background
- Amber/gold accents
- Scrollable list

**Content:**
- Header: "Tonight's Lineup" (wide) or "Up Next" (narrow)
- Numbered list: name and song title
- Empty state: "No singers yet - be first!"

### Jukebox Page Updates

Modify `Jukebox.tsx` to use CSS Grid layout:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
  {/* Narrow: banner at top */}
  <EventPoster variant="banner" className="lg:hidden" ... />

  {/* Wide: poster on left */}
  <EventPoster variant="poster" className="hidden lg:block" ... />

  {/* Jukebox (always visible) */}
  <JukeboxShell ... />

  {/* Queue panel */}
  <LineupPanel queue={state.queue} ... />
</div>
```

## Breakpoints

- `lg` (1024px): Switch from stacked to three-column
- Below 1024px: Vertical scroll layout

## File Changes

1. **New:** `src/components/EventPoster.tsx` - Vintage poster component
2. **New:** `src/components/LineupPanel.tsx` - Queue display panel
3. **Modified:** `src/pages/Jukebox.tsx` - Grid layout wrapper
4. **Modified:** `src/index.css` - Any custom CSS for texture effects
