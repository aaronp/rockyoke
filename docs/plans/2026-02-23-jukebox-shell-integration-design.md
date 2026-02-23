# JukeboxShell Integration Design

## Overview

Replace the current JukeboxFrame component with JukeboxShell - a detailed SVG jukebox with three slots for functional components.

## Approach

Full replacement of JukeboxFrame with JukeboxShell (Approach 1):
- Convert JukeboxShell.jsx to TypeScript
- Update Jukebox.tsx page to use new component
- Delete old frame components
- Integrate queue display into SignUpWizard

---

## Section 1: Component Structure

**Files to create/modify:**

| File | Action |
|------|--------|
| `src/components/jukebox/JukeboxShell.tsx` | Create (convert from JSX) |
| `src/pages/Jukebox.tsx` | Modify imports |
| `src/components/jukebox/SignUpWizard.tsx` | Add queue prop |

**Files to delete:**

| File | Reason |
|------|--------|
| `src/JukeboxShell.jsx` | Replaced by TSX version |
| `src/components/jukebox/JukeboxFrame.tsx` | Replaced by JukeboxShell |
| `src/components/jukebox/ArchFrame.tsx` | Shell has arch built-in |
| `src/components/jukebox/PanelFrame.tsx` | No longer needed |
| `src/components/jukebox/BaseFrame.tsx` | No longer needed |

**Files unchanged:**

- `src/components/jukebox/Wurlitzer.tsx`
- `src/components/jukebox/Rolodex.tsx`
- `src/components/jukebox/QueueDisplay.tsx` (keep for reference)

---

## Section 2: Slot Mapping

JukeboxShell has three slots positioned in SVG-coordinate space (viewBox 800x1220):

| Slot | Position (x, y, w, h) | Component |
|------|----------------------|-----------|
| `recordPlayer` | 205, 285, 390, 232 | Wurlitzer |
| `songRolodex` | 250, 433, 300, 106 | Rolodex |
| `songQueue` | 148, 622, 504, 374 | SignUpWizard (with inline queue) |

**Prop interface:**

```tsx
// JukeboxShell props
type Props = {
  recordPlayer?: React.ReactNode;
  songRolodex?: React.ReactNode;
  songQueue?: React.ReactNode;
};
```

---

## Section 3: SignUpWizard with Inline Queue

Add `queue` prop to SignUpWizard. Display queue entries below wizard content when in `idle` state.

**New props:**

```tsx
type Props = {
  wizardState: WizardState;
  selectedSong: Song | null;
  lastEntry: QueueEntry | null;
  onStartSignUp: () => void;
  onSubmitName: (name: string) => void;
  onSubmitPayment: () => void;
  onReset: () => void;
  queue: QueueEntry[];  // NEW
};
```

**Layout in idle state:**

```
+-------------------------------------+
|  "Pick a song to get started!"      |
+-------------------------------------+
|  Queue:                             |
|  #001 - John - Sweet Child O' Mine  |
|  #002 - Sarah - Don't Stop Believin'|
+-------------------------------------+
```

---

## Implementation Notes

- JukeboxShell uses percentage-based positioning for slot overlays
- SVG is purely decorative (pointer-events: none)
- Slots receive all click events
- Shell maintains 800:1220 aspect ratio via padding trick
