// src/pages/Jukebox.tsx
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  JukeboxFrame,
  Wurlitzer,
  Rolodex,
  SignUpWizard,
  QueueDisplay,
} from "@/components/jukebox";
import { useJukeboxState } from "@/hooks/useJukeboxState";

export default function Jukebox() {
  const state = useJukeboxState();

  // Trigger Wurlitzer when entering "playing" state
  const shouldTriggerPlay = state.wizardState === "playing";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <JukeboxFrame
          wurlitzer={
            <Wurlitzer
              triggerPlay={shouldTriggerPlay}
              onPlayComplete={state.onPlayComplete}
              showControls={state.wizardState === "idle"}
            />
          }
          rolodex={
            <Rolodex onSelectSong={state.selectSong} />
          }
          wizard={
            <SignUpWizard
              wizardState={state.wizardState}
              selectedSong={state.selectedSong}
              lastEntry={state.lastEntry}
              onStartSignUp={state.startSignUp}
              onSubmitName={state.submitName}
              onSubmitPayment={state.submitPayment}
              onReset={state.reset}
            />
          }
          queue={
            state.queue.length > 0 ? (
              <QueueDisplay queue={state.queue} />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
