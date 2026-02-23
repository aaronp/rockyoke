// src/pages/Jukebox.tsx
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  JukeboxShell,
  Wurlitzer,
  Rolodex,
  SignUpWizard,
} from "@/components/jukebox";
import { useJukeboxState } from "@/hooks/useJukeboxState";

export default function Jukebox() {
  const state = useJukeboxState();
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [needleDown, setNeedleDown] = useState(false);

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 overflow-auto">
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
      <div className="flex min-h-screen items-center justify-center py-8 px-4">
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
            <Rolodex onSelectSong={state.selectSong} />
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
            />
          }
        />
      </div>
    </div>
  );
}
