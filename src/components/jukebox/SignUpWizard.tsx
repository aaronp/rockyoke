// src/components/jukebox/SignUpWizard.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WizardState, Song, QueueEntry } from "@/types/jukebox";

type Props = {
  wizardState: WizardState;
  selectedSong: Song | null;
  lastEntry: QueueEntry | null;
  onStartSignUp: () => void;
  onSubmitName: (name: string) => void;
  onSubmitPayment: () => void;
  onReset: () => void;
};

export function SignUpWizard({
  wizardState,
  selectedSong,
  lastEntry,
  onStartSignUp,
  onSubmitName,
  onSubmitPayment,
  onReset,
}: Props) {
  const [nameInput, setNameInput] = useState("");

  // Auto-reset after complete
  useEffect(() => {
    if (wizardState === "complete") {
      const timer = setTimeout(onReset, 3000);
      return () => clearTimeout(timer);
    }
  }, [wizardState, onReset]);

  return (
    <div className="flex h-full items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {wizardState === "idle" && (
          <WizardPanel key="idle">
            <p className="text-lg text-amber-100">Pick a song to get started!</p>
          </WizardPanel>
        )}

        {wizardState === "song-selected" && selectedSong && (
          <WizardPanel key="song-selected">
            <p className="text-sm text-amber-200">You selected:</p>
            <p className="mt-1 text-lg font-bold text-amber-50">{selectedSong.title}</p>
            <p className="text-sm text-amber-300">{selectedSong.artist}</p>
            <Button
              onClick={onStartSignUp}
              className="mt-4 bg-rose-600 hover:bg-rose-500"
            >
              Sign Up to Sing
            </Button>
          </WizardPanel>
        )}

        {wizardState === "enter-name" && (
          <WizardPanel key="enter-name">
            <p className="mb-3 text-amber-100">Enter your name(s):</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (nameInput.trim()) {
                  onSubmitName(nameInput.trim());
                }
              }}
              className="flex flex-col gap-3"
            >
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="bg-neutral-800 border-amber-600 text-amber-50"
                autoFocus
              />
              <Button
                type="submit"
                className="bg-amber-500 text-amber-950 hover:bg-amber-400"
                disabled={!nameInput.trim()}
              >
                🪙 Insert Coin
              </Button>
            </form>
          </WizardPanel>
        )}

        {wizardState === "playing" && (
          <WizardPanel key="playing">
            <p className="text-amber-200">Adding to queue...</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
              <span className="text-sm text-amber-300">Watch the Wurlitzer!</span>
            </div>
          </WizardPanel>
        )}

        {wizardState === "complete" && lastEntry && (
          <WizardPanel key="complete">
            <p className="text-lg text-green-400">You're in the queue!</p>
            <p className="mt-2 font-mono text-2xl font-bold text-amber-100">
              {lastEntry.ticketNumber}
            </p>
            <p className="mt-1 text-sm text-amber-300">
              {lastEntry.name} - {lastEntry.song.title}
            </p>
          </WizardPanel>
        )}
      </AnimatePresence>
    </div>
  );
}

function WizardPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="text-center"
    >
      {children}
    </motion.div>
  );
}
