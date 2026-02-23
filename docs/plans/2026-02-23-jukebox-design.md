# Rockyoke Jukebox Design

## Overview

A karaoke jukebox application that combines three functional areas into a unified jukebox interface:
- **Wurlitzer record player** (top arch) - plays animation when song is selected
- **Rolodex song picker** (middle) - split-flap display for browsing/selecting songs
- **Sign-up wizard** (bottom) - name entry, fake payment, queue management

## Design Decisions

- **Queue-based sign-up flow**: User selects song → enters name → Wurlitzer plays → fake payment → added to queue
- **Local-only state** with placeholder hooks for future backend integration
- **Hybrid visual system**: SVG/CSS for structural frames, PNG slices for ornate decorative trim
- **Component-first layout**: Functional components drive the layout (not positioned over an image)

---

## Section 1: Component Structure

### File Organization

```
src/
  components/jukebox/
    JukeboxFrame.tsx      # Main container with three sections
    ArchFrame.tsx         # Top arch housing Wurlitzer
    PanelFrame.tsx        # Middle panel housing Rolodex
    BaseFrame.tsx         # Bottom section housing sign-up wizard
    SignUpWizard.tsx      # Multi-step sign-up form
    QueueDisplay.tsx      # Shows current queue
    frames/               # PNG slices for decorative trim
      arch-trim-left.png
      arch-trim-right.png
      panel-corners.png
      ...
  pages/
    Jukebox.tsx           # Route component, composes JukeboxFrame
  hooks/
    useJukeboxState.ts    # Central state machine
    useQueue.ts           # Queue management (placeholder for backend)
  types/
    jukebox.ts            # Shared types
```

### State Management

Single `useJukeboxState` hook manages:
- Current wizard step
- Selected song
- User name input
- Queue entries
- Wurlitzer play trigger

### Types

```typescript
type Song = {
  id: string;
  number: string;     // e.g., "A7"
  title: string;
  artist: string;
};

type QueueEntry = {
  id: string;
  name: string;
  song: Song;
  ticketNumber: string;
  timestamp: number;
};

type WizardState =
  | 'idle'
  | 'song-selected'
  | 'enter-name'
  | 'playing'
  | 'payment'
  | 'complete';
```

---

## Section 2: Sign-Up Wizard Flow

### State Machine

```
idle → song-selected → enter-name → playing → payment → complete → idle
         ↑                                                    |
         └────────────────────────────────────────────────────┘
```

### Wizard States

| State | Display | User Action | Next |
|-------|---------|-------------|------|
| `idle` | "Pick a song!" prompt | Select song via Rolodex | `song-selected` |
| `song-selected` | Song title + "Sign Up" button | Click sign up | `enter-name` |
| `enter-name` | Name input field | Enter name + submit | `playing` |
| `playing` | "Now playing..." + Wurlitzer animates | Auto-advance when animation completes | `payment` |
| `payment` | Fake payment UI (insert coin animation) | Click to pay | `complete` |
| `complete` | Ticket number + "You're in the queue!" | Auto-reset after delay | `idle` |

### Interaction Flow

1. **Song Selection**: User punches in song number OR clicks song in Rolodex
2. **Name Entry**: Simple text input, validates non-empty
3. **Wurlitzer Animation**: Triggers automatically, ~5 second sequence
4. **Fake Payment**: Animated coin slot, any click proceeds
5. **Confirmation**: Shows queue position, ticket number, resets after 3s

### Queue Management

```typescript
// useQueue.ts
function useQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);

  const addToQueue = (name: string, song: Song) => {
    // Placeholder: would POST to backend
    const entry: QueueEntry = {
      id: crypto.randomUUID(),
      name,
      song,
      ticketNumber: generateTicketNumber(),
      timestamp: Date.now(),
    };
    setQueue(prev => [...prev, entry]);
    return entry;
  };

  return { queue, addToQueue };
}
```

---

## Section 3: Visual Frame System

### Hybrid Approach

| Element | Technique | Rationale |
|---------|-----------|-----------|
| Main arch shape | SVG path | Precise curves, scalable |
| Panel borders | CSS borders + gradients | Simple rectangles |
| Ornate trim pieces | PNG slices | Complex decorative details |
| Chrome highlights | CSS gradients | Consistent metallic look |
| Wood grain background | CSS gradient or subtle PNG | Texture without complexity |

### Color Palette (from jukebox image)

```css
:root {
  --jukebox-cream: #F5E6D3;
  --jukebox-gold: #C4A35A;
  --jukebox-dark-wood: #4A3728;
  --jukebox-medium-wood: #8B6914;
  --jukebox-chrome: #B8B8B8;
}
```

### Frame Components

**ArchFrame.tsx**
- SVG `<path>` for arch outline
- CSS gradient fill for wood look
- PNG slices positioned at corners for ornate trim
- Fixed aspect ratio container for Wurlitzer

**PanelFrame.tsx**
- CSS border with inset shadow
- Gold border accent
- PNG corner pieces for decorative elements
- Flexible height to accommodate Rolodex content

**BaseFrame.tsx**
- Simpler rectangular panel
- Chrome-style border treatment
- Houses wizard UI with adequate padding

### Responsive Behavior

- Fixed max-width (~500px) to maintain jukebox proportions
- Centers horizontally on larger screens
- Vertical scroll on smaller screens (no horizontal scaling)

---

## Future Considerations

- Backend integration via `useQueue` hook abstraction
- Real payment integration (Stripe, etc.)
- Song database with search
- Admin view for managing queue
- Audio playback integration
