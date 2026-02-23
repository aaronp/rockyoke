# Button Panel Design

## Goal

Replace the round button area below the rolodex with old-fashioned punch-in buttons for selecting songs by code (e.g., "A01", "B03"), plus an LED display showing the entered code.

## Song Code System

**Format:** Letter (A-K) + two digits (01-06)

**Mapping:** Each rolodex page gets a letter, songs numbered sequentially within the page.
- Page 1 (songs 1-6) → A01-A06
- Page 2 (songs 7-12) → B01-B06
- ...
- Page 11 (songs 61-66) → K01-K06

**Changes to Song type:**
```typescript
// Song IDs change from "1" to "A01"
{ id: "A01", number: "A01", title: "...", artist: "..." }
```

## ButtonPanel Component

### Layout
```
┌─────────────────────────────────────────────┐
│          ┌───────────┐                      │
│          │  A 0 1    │  ← LED Display       │
│          └───────────┘                      │
├─────────────────────────────────────────────┤
│  [A][B][C][D][E][F][G][H][I][J][K]          │ ← Letter row
│  [0][1][2][3][4][5][6]  [▲][▼] [CLR][ENTER] │ ← Number row + controls
└─────────────────────────────────────────────┘
```

### LED Display
- 3-character segmented display
- Shows current input: `"___"` → `"A__"` → `"A0_"` → `"A01"`
- Green/amber glow on dark background
- Flashes red briefly on invalid code

### Button Styling
- Raised rectangular buttons with beveled edges
- Cream/ivory color with dark text (vintage typewriter aesthetic)
- Subtle press animation on click
- Tactile click sound (reuse clack sound from Rolodex)

### Props
```typescript
type Props = {
  onSelectSong: (code: string) => void;  // Called with "A01" etc on Enter
  onNavigateUp: () => void;              // Flip rolodex up
  onNavigateDown: () => void;            // Flip rolodex down
};
```

## Integration

### JukeboxShell
- Add slot 4 for ButtonPanel between rolodex and queue
- Position at approximately y=555-615 in SVG coordinates
- New prop: `buttonPanel: ReactNode`

### Rolodex
- Remove up/down navigation buttons (moved to ButtonPanel)
- Accept `pageIndex` as controlled prop
- Accept `onPageChange` callback

### Jukebox.tsx
```typescript
// Lift page state for coordination
const [rolodexPage, setRolodexPage] = useState(0);

const handleNavigateUp = () => setRolodexPage(p => Math.max(0, p - 1));
const handleNavigateDown = () => setRolodexPage(p => Math.min(10, p + 1));

const handleCodeEntry = (code: string) => {
  const song = findSongByCode(code);
  if (song) state.selectSong(song);
};
```

## Input Behavior

### State Machine
1. Letter must be entered first
2. Then two digits
3. Pressing a new letter replaces existing letter
4. Digits fill next available slot (max 2)

### Validation
- Valid: A01-A06, B01-B06, ... K01-K06 (66 total)
- Invalid: A00, A07, L01, etc. → flash display red

### Controls
- Clear: Reset to empty (`"___"`)
- Enter: Validate and select song if valid

### Keyboard Support
- A-K: Type letters
- 0-9: Type digits
- Backspace: Clear
- Enter: Submit
- Arrow up/down: Navigate rolodex

## Out of Scope (YAGNI)
- History of entered codes
- Autocomplete/suggestions
- Code display on queued songs (keep using title)
