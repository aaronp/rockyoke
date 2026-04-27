// src/lib/song-submission.ts
import type { SelectedSong } from "@/types/jukebox";

// Google Form configuration
const GOOGLE_FORM_RESPONSE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf3q45SqucfORu-71UJOnsMBsjHpbRiHS0C-GUunwt0RsBaXA/formResponse";
const FIELD_CLIENT_ID = "entry.1314282448";
const FIELD_ORDER_IDS = "entry.714062364";
const FIELD_SONGS = "entry.2069328495";
const FIELD_TIMESTAMP = "entry.672528189";

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
  console.log("[song-submission] POST to Google Forms:", Object.fromEntries(params));
  fetch(GOOGLE_FORM_RESPONSE_URL, {
    method: "POST",
    mode: "no-cors",
    body: params,
  }).then(
    () => console.log("[song-submission] POST sent (no-cors, opaque response)"),
    (err) => console.error("[song-submission] POST failed:", err),
  );
}

export function submitSnapshotBeacon(params: URLSearchParams): void {
  console.log("[song-submission] sendBeacon to Google Forms:", Object.fromEntries(params));
  navigator.sendBeacon(GOOGLE_FORM_RESPONSE_URL, params);
}
