// src/pages/Jukebox.tsx
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  JukeboxShell,
  Wurlitzer,
  Rolodex,
  SignUpWizard,
  ButtonPanel,
} from "@/components/jukebox";
import { findSongByCode } from "@/components/jukebox/Rolodex";
import { useJukeboxState } from "@/hooks/useJukeboxState";
import type { DisplayState } from "@/components/jukebox/ButtonPanel";
import backgroundImage from "../background.png";

export default function Jukebox() {
  const state = useJukeboxState();
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [needleDown, setNeedleDown] = useState(false);
  const [rolodexPage, setRolodexPage] = useState(0);
  const [codeInput, setCodeInput] = useState("");
  const [codeDisplayState, setCodeDisplayState] = useState<DisplayState>("normal");
  const totalPages = 11; // A-K

  const handleNavigateUp = useCallback(() => {
    setRolodexPage(p => Math.max(0, p - 1));
  }, []);

  const handleNavigateDown = useCallback(() => {
    setRolodexPage(p => Math.min(totalPages - 1, p + 1));
  }, []);

  const handleCodeEntry = useCallback((code: string) => {
    const song = findSongByCode(code);
    if (song) {
      state.selectSong(song);
    }
  }, [state]);

  // Trigger Wurlitzer when entering "playing" state OR preview is playing
  const shouldTriggerPlay = state.wizardState === "playing" || previewPlaying;
  const shouldTriggerReset = !previewPlaying && state.wizardState === "song-selected";

  const handlePreviewStart = useCallback(() => {
    setPreviewPlaying(true);
    setNeedleDown(false);
  }, []);

  const handlePreviewEnd = useCallback(() => {
    setPreviewPlaying(false);
    setNeedleDown(false);
  }, []);

  const handleNeedleDown = useCallback(() => {
    setNeedleDown(true);
  }, []);

  return (
    <div
      className="relative min-h-screen text-neutral-100 overflow-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay for ~20% background visibility */}
      <div className="absolute inset-0 bg-neutral-950/80" />

      {/* Header */}
      <div className="absolute left-4 top-4 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-lg bg-neutral-900/80 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Jukebox */}
      <div className="relative z-10 flex min-h-screen items-center justify-center py-8 px-4">
        <JukeboxShell
          recordPlayer={
            <Wurlitzer
              triggerPlay={shouldTriggerPlay}
              triggerReset={shouldTriggerReset}
              onPlayComplete={previewPlaying ? undefined : state.onPlayComplete}
              onReset={state.reset}
              onNeedleDown={previewPlaying ? handleNeedleDown : undefined}
              showControls={state.wizardState === "idle"}
            />
          }
          songRolodex={
            <Rolodex
              onSelectSong={state.selectSong}
              pageIndex={rolodexPage}
              onPageChange={setRolodexPage}
            />
          }
          buttonPanel={
            <ButtonPanel
              onSelectSong={handleCodeEntry}
              onNavigateUp={handleNavigateUp}
              onNavigateDown={handleNavigateDown}
              canNavigateUp={rolodexPage > 0}
              canNavigateDown={rolodexPage < totalPages - 1}
              input={codeInput}
              onInputChange={setCodeInput}
              displayState={codeDisplayState}
              onDisplayStateChange={setCodeDisplayState}
            />
          }
          songQueue={
            <SignUpWizard
              wizardState={state.wizardState}
              selectedSong={state.selectedSong}
              lastEntry={state.lastEntry}
              onStartSignUp={state.startSignUp}
              onSubmitName={state.submitName}
              onSubmitPayment={state.submitPayment}
              onReset={state.reset}
              onPreviewStart={handlePreviewStart}
              onPreviewEnd={handlePreviewEnd}
              triggerPlayAudio={needleDown}
              queue={state.queue}
              codeInput={codeInput}
              codeDisplayState={codeDisplayState}
            />
          }
        />
      </div>
    </div>
  );
}
