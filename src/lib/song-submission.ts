// src/lib/song-submission.ts
import type { SelectedSong } from "@/types/jukebox";

// Google Form configuration
// Replace these with actual values after creating the form
const GOOGLE_FORM_RESPONSE_URL = "https://docs.google.com/forms/d/e/FORM_ID/formResponse";
const FIELD_CLIENT_ID = "entry.REPLACE_ME_1";
const FIELD_ORDER_IDS = "entry.REPLACE_ME_2";
const FIELD_SONGS = "entry.REPLACE_ME_3";
const FIELD_TIMESTAMP = "entry.REPLACE_ME_4";

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
