// src/hooks/useJukeboxState.ts
import { useState, useCallback } from "react";
import type { Song, QueueEntry, WizardState } from "@/types/jukebox";
import { useQueue } from "./useQueue";

export function useJukeboxState() {
  const [wizardState, setWizardState] = useState<WizardState>("idle");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [userName, setUserName] = useState("");
  const [lastEntry, setLastEntry] = useState<QueueEntry | null>(null);
  const { queue, addToQueue, removeFromQueue, clearQueue } = useQueue();

  const selectSong = useCallback((song: Song) => {
    setSelectedSong(song);
    setWizardState("song-selected");
  }, []);

  const startSignUp = useCallback(() => {
    if (selectedSong) {
      setWizardState("enter-name");
    }
  }, [selectedSong]);

  const submitName = useCallback((name: string) => {
    setUserName(name);
    setWizardState("playing");
  }, []);

  const onPlayComplete = useCallback(() => {
    setWizardState("payment");
  }, []);

  const submitPayment = useCallback(() => {
    if (selectedSong && userName) {
      const entry = addToQueue(userName, selectedSong);
      setLastEntry(entry);
      setWizardState("complete");
    }
  }, [selectedSong, userName, addToQueue]);

  const reset = useCallback(() => {
    setWizardState("idle");
    setSelectedSong(null);
    setUserName("");
    setLastEntry(null);
  }, []);

  return {
    // State
    wizardState,
    selectedSong,
    userName,
    lastEntry,
    queue,

    // Actions
    selectSong,
    startSignUp,
    submitName,
    onPlayComplete,
    submitPayment,
    reset,
    removeFromQueue,
    clearQueue,
  };
}

export type JukeboxStateReturn = ReturnType<typeof useJukeboxState>;
