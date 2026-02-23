// src/components/jukebox/SignUpWizard.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WizardState, Song, QueueEntry } from "@/types/jukebox";

// Hook to fetch iTunes preview URL and manage playback
function useItunesPreview(onEnd?: () => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  // Create audio element once
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => {
      setIsPlaying(false);
      onEndRef.current?.();
    });
    audioRef.current.addEventListener("pause", () => setIsPlaying(false));
    audioRef.current.addEventListener("play", () => setIsPlaying(true));
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const fetchPreview = useCallback(async (title: string, artist: string) => {
    setIsLoading(true);
    setPreviewUrl(null);
    try {
      const query = encodeURIComponent(`${title} ${artist}`);
      const res = await fetch(
        `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`
      );
      const data = await res.json();
      if (data.results?.[0]?.previewUrl) {
        setPreviewUrl(data.results[0].previewUrl);
      }
    } catch (err) {
      console.error("Failed to fetch iTunes preview:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const play = useCallback(() => {
    if (audioRef.current && previewUrl) {
      audioRef.current.src = previewUrl;
      audioRef.current.play();
    }
  }, [previewUrl]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { isPlaying, isLoading, previewUrl, fetchPreview, play, stop };
}

type Props = {
  wizardState: WizardState;
  selectedSong: Song | null;
  lastEntry: QueueEntry | null;
  onStartSignUp: () => void;
  onSubmitName: (name: string) => void;
  onSubmitPayment: () => void;
  onReset: () => void;
  onPreviewStart?: () => void;
  onPreviewEnd?: () => void;
  queue?: QueueEntry[];
};

export function SignUpWizard({
  wizardState,
  selectedSong,
  lastEntry,
  onStartSignUp,
  onSubmitName,
  onSubmitPayment,
  onReset,
  onPreviewStart,
  onPreviewEnd,
  queue = [],
}: Props) {
  const [nameInput, setNameInput] = useState("");
  const preview = useItunesPreview(onPreviewEnd);

  // Wrap play to also trigger onPreviewStart
  const handlePreviewPlay = useCallback(() => {
    preview.play();
    onPreviewStart?.();
  }, [preview.play, onPreviewStart]);

  // Wrap stop to also trigger onPreviewEnd
  const handlePreviewStop = useCallback(() => {
    preview.stop();
    onPreviewEnd?.();
  }, [preview.stop, onPreviewEnd]);

  // Fetch preview when song is selected
  useEffect(() => {
    if (wizardState === "song-selected" && selectedSong) {
      preview.fetchPreview(selectedSong.title, selectedSong.artist);
    }
  }, [wizardState, selectedSong, preview.fetchPreview]);

  // Stop preview when leaving song-selected state
  useEffect(() => {
    if (wizardState !== "song-selected") {
      preview.stop();
      onPreviewEnd?.();
    }
  }, [wizardState, preview.stop, onPreviewEnd]);

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
            {queue.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-sm font-semibold text-amber-300">Up Next:</p>
                <ul className="mt-2 space-y-1">
                  {queue.map((entry) => (
                    <li key={entry.id} className="text-sm text-amber-200">
                      <span className="font-mono text-amber-400">{entry.ticketNumber}</span>
                      {" - "}
                      <span>{entry.name}</span>
                      {" - "}
                      <span className="text-amber-300">{entry.song.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </WizardPanel>
        )}

        {wizardState === "song-selected" && selectedSong && (
          <WizardPanel key="song-selected">
            <p className="text-sm text-amber-200">You selected:</p>
            <p className="mt-1 text-lg font-bold text-amber-50">{selectedSong.title}</p>
            <p className="text-sm text-amber-300">{selectedSong.artist}</p>

            {/* Preview buttons */}
            <div className="mt-3 flex justify-center gap-2">
              {preview.isLoading ? (
                <span className="text-xs text-amber-400">Loading preview...</span>
              ) : preview.previewUrl ? (
                <>
                  {!preview.isPlaying ? (
                    <Button
                      size="sm"
                      onClick={handlePreviewPlay}
                      className="h-8 gap-1 bg-amber-600 px-3 text-amber-950 hover:bg-amber-500"
                    >
                      <Play className="h-3 w-3" /> Preview
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handlePreviewStop}
                      className="h-8 gap-1 bg-amber-700 px-3 text-amber-100 hover:bg-amber-600"
                    >
                      <Square className="h-3 w-3" /> Stop
                    </Button>
                  )}
                </>
              ) : (
                <span className="text-xs text-amber-500">No preview available</span>
              )}
            </div>

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
