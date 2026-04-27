# Song Request Tracking via Google Forms

## Problem

Users buy tickets via Ticket Tailor and pick songs on the jukebox, but there's no way for the organiser to know who picked what. Song choices exist only in browser memory and are lost on refresh. The organiser needs to correlate ticket holders (name, email from Ticket Tailor) with their song requests.

## Solution

Store song requests in localStorage alongside ticket IDs. Silently POST a full snapshot of requests to a Google Sheet (via Google Forms) on every change, debounced. The organiser joins the sheet with Ticket Tailor's export on order ID.

**This is advisory request tracking only.** Ticket ownership remains authoritative in Ticket Tailor. A user can edit localStorage and submit anything. For this use case that's acceptable -- this is organiser-assist data, not payment, identity, or entitlement.

## User Flow

1. User browses the jukebox, optionally selects a song
2. User opens "Buy Tickets" modal
3. Modal shows event details, a scrollable song checklist (pre-checked with any jukebox selection), a disclaimer, and the "Buy Tickets" button
4. User picks songs from the checklist, clicks "Buy Tickets" -> Ticket Tailor widget opens
5. After purchase, user returns to site with order ID saved to localStorage
6. Song requests + order ID are debounce-POSTed to Google Forms (full snapshot)
7. User can change song requests anytime -- a header banner shows current selections
8. Every change triggers a debounced POST (appends a new snapshot row; organiser takes latest per client request ID or order ID)

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
  clientRequestId: string,  // generated once per browser, persisted
  selectedSongs: SelectedSong[]
}
```

The `SelectedSong` type is a discriminated union:
```typescript
type SelectedSong =
  | {
      kind: "catalog";
      number: string;   // e.g. "A01" -- matches Song.number
      title: string;
      artist: string;
    }
  | {
      kind: "custom";
      number: "L01";
      title: string;    // user-provided
      artist?: string;  // user-provided, optional
    };
```

Notes:
- `clientRequestId` is a UUID generated on first visit and stored permanently. It identifies this browser across sessions, allowing pre-purchase song selections to be correlated with post-purchase submissions.
- `selectedSongs` is independent of tickets -- users can select songs before or after purchasing. Songs persist across sessions.
- Backward-compatible: existing localStorage entries will have `selectedSongs` as `undefined` and `clientRequestId` as `undefined`. The hook defaults `selectedSongs` to `[]` and generates a new `clientRequestId` on first read.

### 2. Song Data Extraction

Move the song catalog out of `Rolodex.tsx` into a shared data module:

```
src/data/songs.ts    -- SONGS array, songCode(), findSongByCode(), SONG_BY_CODE, getTotalPages()
```

Both `Rolodex.tsx` and `SongChecklist.tsx` import from `src/data/songs.ts`. This eliminates the current smell of importing data from a UI component.

### 3. Buy Tickets Modal Changes

Add between event details and "Buy Tickets" button:

- **Song checklist**: scrollable list of all songs from `src/data/songs.ts`. Each row: checkbox + code + title + artist. Simple, compact layout (not the jukebox aesthetic).
- **Pre-checked**: if a song is currently selected on the jukebox, it's pre-checked. Any previously selected songs (from localStorage) are also checked.
- **Search/filter**: text input to filter the list by title or artist (67 songs is a lot to scroll).
- **"Request a Song" option**: the existing request entry (L01) appears in the list. If selected, show text inputs for custom song title and artist.
- **Disclaimer**: below the checklist: *"Song choices are requests only and not guaranteed. The band will do their best to accommodate your preferences on the night."*

### 4. Header Banner

When a user has selected songs (regardless of ticket ownership):

- Show a compact banner at the top of the jukebox page
- Text: "Your song requests: Hard To Handle, Hysteria" (comma-separated titles)
- Tappable/clickable to open a standalone modal with just the song checklist (not the full TicketModal)
- Visible on both mobile and desktop

### 5. Google Forms Submission

**Setup (manual, one-time):**
- Create a Google Form with four "Paragraph" fields: Client Request ID, Order ID(s), Song Selections, Timestamp
- The form response URL and field entry IDs are stored as constants in the app

**Submission logic:**
- Debounced POST fires 4 seconds after the last change to **either** `selectedSongs` or `tickets` in localStorage.
- Firing on ticket changes is critical: when a user selects songs pre-purchase, the first POST has no order ID. After purchase completes, the ticket is added to localStorage, which triggers a re-POST with the now-known order ID.
- **Dirty tracking**: before POSTing, compute a hash of `clientRequestId + orderIds + serializedSongs`. Skip the POST if the hash matches `lastSubmittedHash`. This avoids redundant identical submissions on re-renders or hook remounts.
- Normal debounced submits use `fetch`:

```typescript
fetch(GOOGLE_FORM_RESPONSE_URL, {
  method: 'POST',
  mode: 'no-cors',
  body: new URLSearchParams({
    'entry.CLIENT_ID_FIELD': clientRequestId,
    'entry.ORDER_ID_FIELD': orderIds,      // e.g. "OID-123,OID-456"
    'entry.SONGS_FIELD': songsSerialized,  // e.g. "A01 Hard To Handle - The Black Crowes, B03 Dakota - Stereophonics"
    'entry.TIMESTAMP_FIELD': new Date().toISOString(),
  }),
});
```

- On `beforeunload`, use `navigator.sendBeacon` instead of `fetch` (fetch is unreliable during page teardown):

```typescript
navigator.sendBeacon(
  GOOGLE_FORM_RESPONSE_URL,
  new URLSearchParams({ ...fields })
);
```

- Because `no-cors` returns an opaque response, the app cannot confirm success. Submission is best-effort. The design relies on repeated full-snapshot posts after each change to achieve eventual consistency.

**Multi-ticket / multi-order semantics:**
- All known local order IDs are submitted with the current song snapshot.
- If someone buys tickets twice, both order IDs are included in every subsequent POST.
- Organiser treats each order ID as associated with the same current request set.

**Deduplication (organiser side):**
- Sort by timestamp descending
- Deduplicate by order ID if present, else by client request ID
- Latest row wins
- Join with Ticket Tailor CSV export on order ID to get name/email

### 6. Existing Sign-Up Wizard

The current wizard flow (select song -> enter name -> confirm) and the in-memory queue system are **replaced** by the new song-request checklist. There is no longer a live queue visible to all users -- song requests are tracked in the Google Sheet for the organiser to manage.

The SignUpWizard component in the song queue slot is simplified to show:
- LED display + current song selections summary (or "Pick songs to get started!")
- "Pick Songs" button (opens a standalone song checklist modal)
- "Buy Tickets" button (if no tickets owned)

The `useJukeboxState` hook and `useQueue` hook are no longer needed for sign-up flow. The jukebox page-level state is simplified: the Rolodex/ButtonPanel still allow browsing and previewing songs, but "selecting" a song now means toggling it in `selectedSongs` rather than entering the wizard flow.

### 7. What Doesn't Change

- Ticket Tailor integration (widget, redirect, order ID capture)
- Jukebox browsing experience (Rolodex, ButtonPanel, Wurlitzer, previews)
- Song code system (A01-L01)
- localStorage ticket storage structure

## Data Flow

```
User selects songs (modal checklist or header banner)
  -> localStorage.selectedSongs updated
  -> compute hash(clientRequestId + orderIds + songs)
  -> skip if hash == lastSubmittedHash
  -> debounce 4s
  -> POST to Google Forms (mode: 'no-cors', URLSearchParams body)
  -> Row appended to Google Sheet

User closes tab during debounce window
  -> beforeunload fires sendBeacon with current snapshot

User completes ticket purchase
  -> localStorage.tickets updated with new order ID
  -> hash changes (new order ID) -> debounce triggers re-POST
  -> Row appended with order ID now included

Organiser reads data:
  Google Sheet (latest snapshot per order ID / client request ID)
  + Ticket Tailor export (name, email per order ID)
  = Full picture: who wants to sing what
```

## File Changes

New files:
- `src/data/songs.ts` -- song catalog, songCode(), findSongByCode(), SONG_BY_CODE, getTotalPages(). Extracted from Rolodex.tsx.
- `src/lib/song-submission.ts` -- serialization, hashing, and submission payload logic (pure functions, testable independently)
- `src/hooks/useSongSubmission.ts` -- thin hook: watches selectedSongs + tickets, calls submission logic, manages debounce timer and sendBeacon on unload
- `src/components/SongChecklist.tsx` -- scrollable, filterable song checklist with checkboxes
- `src/components/SongChecklistModal.tsx` -- standalone modal wrapping SongChecklist (for editing from header banner)
- `src/components/SongRequestBanner.tsx` -- header banner showing current selections, opens SongChecklistModal on click

Modified files:
- `src/components/jukebox/Rolodex.tsx` -- remove song data, import from `src/data/songs.ts`
- `src/hooks/useTickets.ts` -- add `selectedSongs` and `clientRequestId` to localStorage schema and TicketStorage type. Default `selectedSongs` to `[]` and generate `clientRequestId` when absent.
- `src/components/TicketModal.tsx` -- add SongChecklist and disclaimer between event details and buy button
- `src/pages/Jukebox.tsx` -- add SongRequestBanner, wire up selectedSongs, simplify song queue slot, remove wizard-related state
- `src/components/jukebox/SignUpWizard.tsx` -- simplify to summary + action buttons (or replace entirely)

## Open Items (for organiser)

- Create the Google Form with four "Paragraph" fields: Client Request ID, Order ID(s), Song Selections, Timestamp
- Share the form response URL and entry field IDs (e.g. `entry.123456789`) for app configuration
