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
};

export function useSongSubmission({
  clientRequestId,
  ticketIds,
  selectedSongs,
}: UseSongSubmissionArgs) {
  const lastHashRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestParamsRef = useRef<URLSearchParams | null>(null);

  useEffect(() => {
    if (!clientRequestId) return;

    const orderIds = ticketIds.join(",");
    const songsSerialized = serializeSongs(selectedSongs);
    const hash = computeSnapshotHash(clientRequestId, orderIds, songsSerialized);

    if (hash === lastHashRef.current) return;

    const params = buildFormParams(clientRequestId, orderIds, songsSerialized);
    latestParamsRef.current = params;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      submitSnapshot(params);
      lastHashRef.current = hash;
      latestParamsRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [clientRequestId, ticketIds, selectedSongs]);

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
