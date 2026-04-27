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
  onSyncError?: (err: Error) => void;
};

export function useSongSubmission({
  clientRequestId,
  ticketIds,
  selectedSongs,
  onSyncError,
}: UseSongSubmissionArgs) {
  const lastHashRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestParamsRef = useRef<URLSearchParams | null>(null);

  useEffect(() => {
    if (!clientRequestId) {
      console.log("[song-submission] Skipping: no clientRequestId yet");
      return;
    }

    if (selectedSongs.length === 0) {
      console.log("[song-submission] Skipping: no songs selected");
      return;
    }

    const orderIds = ticketIds.join(",");
    const songsSerialized = serializeSongs(selectedSongs);
    const hash = computeSnapshotHash(clientRequestId, orderIds, songsSerialized);

    if (hash === lastHashRef.current) {
      console.log("[song-submission] Skipping: hash unchanged", hash);
      return;
    }

    console.log("[song-submission] Change detected, debouncing 4s...", { songs: selectedSongs.length, orderIds, hash });

    const params = buildFormParams(clientRequestId, orderIds, songsSerialized);
    latestParamsRef.current = params;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      submitSnapshot(params, onSyncError);
      lastHashRef.current = hash;
      latestParamsRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [clientRequestId, ticketIds, selectedSongs, onSyncError]);

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
