// src/components/jukebox/SignUpWizard.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WizardState, Song, QueueEntry } from "@/types/jukebox";
import { LEDDisplay, type DisplayState } from "./ButtonPanel";

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
  triggerPlayAudio?: boolean;
  queue?: QueueEntry[];
  codeInput?: string;
  codeDisplayState?: DisplayState;
  onBuyTickets?: () => void;
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
  triggerPlayAudio,
  queue = [],
  codeInput = "",
  codeDisplayState = "normal",
  onBuyTickets,
}: Props) {
  const [nameInput, setNameInput] = useState("");
  const preview = useItunesPreview(onPreviewEnd);

  // Trigger animation start (audio will play when triggerPlayAudio becomes true)
  const handlePreviewPlay = useCallback(() => {
    onPreviewStart?.();
  }, [onPreviewStart]);

  // Play audio when needle reaches record (with slight delay for natural feel)
  useEffect(() => {
    if (triggerPlayAudio && preview.previewUrl) {
      const timer = setTimeout(() => {
        preview.play();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [triggerPlayAudio, preview.previewUrl, preview.play]);

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
    <div className="relative flex h-full flex-col p-3">
      {/* Top action area */}
      <div className="flex-shrink-0">
        <AnimatePresence mode="wait">
          {wizardState === "idle" && (
            <WizardPanel key="idle">
              <p className="text-center text-amber-100">Pick a song to get started!</p>
            </WizardPanel>
          )}

          {wizardState === "song-selected" && selectedSong && (
            <motion.div
              key="song-selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 rounded-lg bg-neutral-800/50 p-2"
            >
              {/* LED Display - shows selected song code */}
              <div className="flex-shrink-0">
                <LEDDisplay value={codeInput} state={codeDisplayState} />
              </div>

              {/* Song info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-amber-50">{selectedSong.title}</p>
                <p className="truncate text-xs text-amber-300">{selectedSong.artist}</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-shrink-0 items-center gap-2">
                {preview.isLoading ? (
                  <span className="text-xs text-amber-400">...</span>
                ) : preview.previewUrl ? (
                  !preview.isPlaying ? (
                    <Button
                      size="sm"
                      onClick={handlePreviewPlay}
                      className="h-8 w-8 rounded-full bg-amber-600 p-0 text-amber-950 hover:bg-amber-500"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handlePreviewStop}
                      className="h-8 w-8 rounded-full bg-amber-700 p-0 text-amber-100 hover:bg-amber-600"
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                  )
                ) : null}
                <Button
                  size="sm"
                  onClick={onBuyTickets ?? onStartSignUp}
                  className="h-8 bg-rose-600 px-3 text-xs hover:bg-rose-500"
                >
                  Sign Up
                </Button>
              </div>
            </motion.div>
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
              className="flex items-center gap-2"
            >
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="flex-1 bg-neutral-800 border-amber-600 text-amber-50"
                autoFocus
              />
              <Button
                type="submit"
                className="bg-amber-500 text-amber-950 hover:bg-amber-400"
                disabled={!nameInput.trim()}
              >
                Register
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

      {/* Queue list - scrollable */}
      {queue.length > 0 && (
        <div className="mt-3 flex-1 overflow-hidden rounded-lg bg-neutral-900/50">
          <div className="sticky top-0 border-b border-amber-900/30 bg-neutral-900/80 px-3 py-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
              Up Next ({queue.length})
            </p>
          </div>
          <div className="h-full overflow-y-auto p-2">
            <ul className="space-y-1">
              {queue.map((entry, index) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 rounded bg-neutral-800/50 px-2 py-1.5 text-sm"
                >
                  <span className="flex-shrink-0 font-mono text-xs text-amber-500">
                    {index + 1}.
                  </span>
                  <span className="min-w-0 flex-1 truncate text-amber-100">
                    {entry.name}
                  </span>
                  <span className="flex-shrink-0 truncate text-xs text-amber-400">
                    {entry.song.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
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
