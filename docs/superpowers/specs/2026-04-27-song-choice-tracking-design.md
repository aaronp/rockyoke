# Song Choice Tracking via Google Forms

## Problem

Users buy tickets via Ticket Tailor and pick songs on the jukebox, but there's no way for the organiser to know who picked what. Song choices exist only in browser memory and are lost on refresh. The organiser needs to correlate ticket holders (name, email from Ticket Tailor) with their song requests.

## Solution

Store song choices in localStorage alongside ticket IDs. Silently POST a full snapshot of choices to a Google Sheet (via Google Forms) on every change, debounced. The organiser joins the sheet with Ticket Tailor's export on order ID.

## User Flow

1. User browses the jukebox, optionally selects a song
2. User opens "Buy Tickets" modal
3. Modal shows event details, a scrollable song checklist (pre-checked with any jukebox selection), a disclaimer, and the "Buy Tickets" button
4. User picks songs from the checklist, clicks "Buy Tickets" -> Ticket Tailor widget opens
5. After purchase, user returns to site with order ID saved to localStorage
6. Song choices + order ID are debounce-POSTed to Google Forms (full snapshot)
7. User can change song choices anytime -- a header banner shows current selections
8. Every change triggers a debounced POST (appends a new snapshot row; organiser takes latest per order ID)

## Components

### 1. localStorage Schema Change

Current:
```typescript
{
  tickets: [{ id: string, purchasedAt: string }],
  pendingConfirmation: boolean
}
```

New:
```typescript
{
  tickets: [{ id: string, purchasedAt: string }],
  pendingConfirmation: boolean,
  selectedSongs: [
    { number: string, title: string, artist: string }
  ]
}
```

Notes:
- `number` matches the existing `Song.number` field (e.g. "A01") from `src/types/jukebox.ts`.
- `selectedSongs` is independent of tickets -- users can select songs before or after purchasing. Songs persist across sessions.
- Backward-compatible: existing localStorage entries will have `selectedSongs` as `undefined`. The hook defaults this to `[]` on read.

### 2. Buy Tickets Modal Changes

Add between event details and "Buy Tickets" button:

- **Song checklist**: scrollable list of all songs. Each row: checkbox + code + title + artist. Simple, compact layout (not the jukebox aesthetic). Song data is imported from the shared `SONGS` array in `Rolodex.tsx` (already exported).
- **Pre-checked**: if a song is currently selected on the jukebox, it's pre-checked. Any previously selected songs (from localStorage) are also checked.
- **Search/filter**: text input to filter the list by title or artist (67 songs is a lot to scroll).
- **"Request a Song" option**: the existing request entry (L01) appears in the list. If selected, show a text input for custom song title and artist.
- **Disclaimer**: below the checklist: *"Song choices are requests only and not guaranteed. The band will do their best to accommodate your preferences on the night."*

### 3. Header Banner

When a user has selected songs (regardless of ticket ownership):

- Show a compact banner at the top of the jukebox page
- Text: "Your song requests: Hard To Handle, Hysteria" (comma-separated titles)
- Tappable/clickable to open a standalone modal with just the song checklist (not the full TicketModal)
- Visible on both mobile and desktop

### 4. Google Forms Submission

**Setup (manual, one-time):**
- Create a Google Form with three fields: Order ID(s), Song Selections, Timestamp
- All three fields should be "Paragraph" type (to handle long song lists)
- The form response URL and field entry IDs are stored as constants in the app

**Submission logic:**
- Debounced POST fires 4 seconds after the last change to **either** `selectedSongs` or `tickets` in localStorage
- Firing on ticket changes is critical: when a user selects songs pre-purchase, the first POST has no order ID. After purchase completes, the ticket is added to localStorage, which triggers a re-POST with the now-known order ID. This ensures all rows are eventually correlated.
- POST uses `fetch` with `mode: 'no-cors'` and `Content-Type: application/x-www-form-urlencoded`:

```typescript
fetch(GOOGLE_FORM_RESPONSE_URL, {
  method: 'POST',
  mode: 'no-cors',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    'entry.ORDER_ID_FIELD': orderIds,      // e.g. "OID-123,OID-456"
    'entry.SONGS_FIELD': songsSerialized,  // e.g. "A01 Hard To Handle - The Black Crowes, B03 Dakota - Stereophonics"
    'entry.TIMESTAMP_FIELD': new Date().toISOString(),
  }),
});
```

- Fire-and-forget: response is opaque with `no-cors`, no error handling needed. If it fails, the next change will send a fresh snapshot.
- If user has no tickets yet, POST with orderIds as empty string.
- Also fires on `beforeunload` (best-effort, unreliable on mobile but catches desktop tab closes during the debounce window).

**Reading the data:**
- Organiser opens the linked Google Sheet
- Sort by timestamp descending, deduplicate by order ID (latest row wins)
- Join with Ticket Tailor CSV export on order ID to get name/email

### 5. Existing Sign-Up Wizard

The current wizard flow (select song -> enter name -> confirm) and the in-memory queue system are **replaced** by the new song-request checklist. There is no longer a live queue visible to all users -- song requests are tracked in the Google Sheet for the organiser to manage.

The SignUpWizard component in the song queue slot is simplified to show:
- LED display + current song selections summary (or "Pick songs to get started!")
- "Pick Songs" button (opens a standalone song checklist modal)
- "Buy Tickets" button (if no tickets owned)

The `useJukeboxState` hook and `useQueue` hook are no longer needed for sign-up flow. The jukebox page-level state is simplified: the Rolodex/ButtonPanel still allow browsing and previewing songs, but "selecting" a song now means toggling it in `selectedSongs` rather than entering the wizard flow.

### 6. What Doesn't Change

- Ticket Tailor integration (widget, redirect, order ID capture)
- Jukebox browsing experience (Rolodex, ButtonPanel, Wurlitzer, previews)
- Song code system (A01-L01)
- localStorage ticket storage structure

## Data Flow

```
User selects songs (modal checklist or header banner)
  -> localStorage.selectedSongs updated
  -> debounce 4s
  -> POST to Google Forms (mode: 'no-cors', x-www-form-urlencoded)
  -> Row appended to Google Sheet

User completes ticket purchase
  -> localStorage.tickets updated with new order ID
  -> debounce triggers re-POST with order ID now included
  -> Row appended to Google Sheet (same songs, now with order ID)

Organiser reads data:
  Google Sheet (latest snapshot per order ID)
  + Ticket Tailor export (name, email per order ID)
  = Full picture: who wants to sing what
```

## File Changes

- `src/hooks/useTickets.ts` -- add `selectedSongs` to localStorage schema and TicketStorage type, expose add/remove/toggle/get. Default `selectedSongs` to `[]` when absent (backward compat).
- `src/hooks/useSongSubmission.ts` -- new hook: watches `selectedSongs` and `tickets` in localStorage, debounced 4s, POSTs snapshot to Google Forms. Also fires on `beforeunload`.
- `src/components/SongChecklist.tsx` -- new component: scrollable, filterable song checklist with checkboxes. Imports song data from `SONGS` array in Rolodex.tsx.
- `src/components/TicketModal.tsx` -- add SongChecklist and disclaimer between event details and buy button.
- `src/components/SongChecklistModal.tsx` -- new component: standalone modal wrapping SongChecklist (for editing songs from the header banner without opening the full TicketModal).
- `src/components/SongRequestBanner.tsx` -- new component: header banner showing current selections, opens SongChecklistModal on click.
- `src/pages/Jukebox.tsx` -- add SongRequestBanner, wire up selectedSongs, simplify song queue slot content, remove wizard-related state.
- `src/components/jukebox/SignUpWizard.tsx` -- simplify to summary + action buttons (or replace entirely).

## Open Items (for organiser)

- Create the Google Form with three "Paragraph" fields: Order ID(s), Song Selections, Timestamp
- Share the form response URL and entry field IDs (e.g. `entry.123456789`) for app configuration
