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
  ticketsRemaining?: number;
  previewingSong?: Song | null;
  onPlaySong?: (song: Song) => void;
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
  ticketsRemaining = 0,
  previewingSong,
  onPlaySong,
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

  // Fetch preview when song is selected OR when previewingSong changes
  useEffect(() => {
    const songToPreview = previewingSong ?? (wizardState === "song-selected" ? selectedSong : null);
    if (songToPreview) {
      preview.fetchPreview(songToPreview.title, songToPreview.artist);
    }
  }, [wizardState, selectedSong, previewingSong, preview.fetchPreview]);

  // Track previous previewingSong to detect when it's cleared
  const prevPreviewingSongRef = useRef<Song | null>(null);

  // Stop preview when leaving song-selected state (and not previewing a queue song)
  useEffect(() => {
    if (wizardState !== "song-selected" && !previewingSong) {
      preview.stop();
    }
  }, [wizardState, previewingSong, preview.stop]);

  // Stop audio when previewingSong is cleared externally (e.g., from LineupPanel stop button)
  useEffect(() => {
    // If previewingSong went from a song to null, stop the audio
    if (prevPreviewingSongRef.current && !previewingSong) {
      preview.stop();
    }
    prevPreviewingSongRef.current = previewingSong;
  }, [previewingSong, preview.stop]);

  // Auto-reset after complete
  useEffect(() => {
    if (wizardState === "complete") {
      const timer = setTimeout(onReset, 3000);
      return () => clearTimeout(timer);
    }
  }, [wizardState, onReset]);

  return (
    <div className="relative flex h-full flex-col p-1.5 sm:p-3">
      {/* Top action area */}
      <div className="flex-shrink-0">
        <AnimatePresence mode="wait">
          {wizardState === "idle" && (
            <WizardPanel key="idle">
              <p className="text-center text-xs sm:text-base text-amber-100">Pick a song to get started!</p>
            </WizardPanel>
          )}

          {wizardState === "song-selected" && selectedSong && (
            <motion.div
              key="song-selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 sm:gap-3 rounded-lg bg-neutral-800/50 p-1.5 sm:p-2"
            >
              {/* LED Display - shows selected song code */}
              <div className="flex-shrink-0 hidden sm:block">
                <LEDDisplay value={codeInput} state={codeDisplayState} />
              </div>

              {/* Song info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs sm:text-sm font-bold text-amber-50">{selectedSong.title}</p>
                <p className="truncate text-[10px] sm:text-xs text-amber-300">{selectedSong.artist}</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                {preview.isLoading ? (
                  <span className="text-xs text-amber-400">...</span>
                ) : preview.previewUrl ? (
                  !preview.isPlaying ? (
                    <Button
                      size="sm"
                      onClick={handlePreviewPlay}
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-amber-600 p-0 text-amber-950 hover:bg-amber-500"
                    >
                      <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handlePreviewStop}
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-amber-700 p-0 text-amber-100 hover:bg-amber-600"
                    >
                      <Square className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  )
                ) : null}
                {ticketsRemaining > 0 ? (
                  <Button
                    size="sm"
                    onClick={onStartSignUp}
                    className="h-6 sm:h-8 bg-rose-600 px-2 sm:px-3 text-[10px] sm:text-xs hover:bg-rose-500"
                  >
                    Sign Up
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={onBuyTickets}
                    className="h-6 sm:h-8 bg-amber-500 px-2 sm:px-3 text-[10px] sm:text-xs text-amber-950 hover:bg-amber-400"
                  >
                    Buy Tickets
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {wizardState === "enter-name" && (
          <WizardPanel key="enter-name">
            <p className="mb-2 sm:mb-3 text-xs sm:text-base text-amber-100">Enter your name(s):</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (nameInput.trim()) {
                  onSubmitName(nameInput.trim());
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="flex-1 bg-neutral-800 border-amber-600 text-amber-50 text-xs sm:text-sm h-7 sm:h-9"
                autoFocus
              />
              <Button
                type="submit"
                className="bg-amber-500 text-amber-950 hover:bg-amber-400 text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-4"
                disabled={!nameInput.trim()}
              >
                Register
              </Button>
            </form>
          </WizardPanel>
        )}

        {wizardState === "complete" && lastEntry && (
          <WizardPanel key="complete">
            <p className="text-sm sm:text-lg text-green-400">You're singing</p>
            <p className="mt-0.5 sm:mt-1 font-bold text-base sm:text-xl text-amber-100">
              {lastEntry.song.title}!
            </p>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-amber-300">
              {lastEntry.name}
            </p>
          </WizardPanel>
        )}
        </AnimatePresence>
      </div>

      {/* Queue list - scrollable */}
      {queue.length > 0 && (
        <div className="mt-1.5 sm:mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-neutral-900/50">
          <div className="flex-shrink-0 border-b border-amber-900/30 bg-neutral-900/80 px-2 sm:px-3 py-1">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-amber-400">
              Up Next ({queue.length})
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-1 sm:p-2">
            <ul className="space-y-0.5 sm:space-y-1">
              {queue.map((entry, index) => {
                const isAnythingPlaying = preview.isPlaying;
                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-1 sm:gap-2 rounded bg-neutral-800/50 px-1.5 sm:px-2 py-1 text-[10px] sm:text-sm"
                  >
                    <span className="flex-shrink-0 font-mono text-[9px] sm:text-xs text-amber-500">
                      {index + 1}.
                    </span>
                    <span className="min-w-0 flex-1 truncate text-amber-100">
                      {entry.name}
                    </span>
                    <span className="flex-shrink-0 truncate text-[9px] sm:text-xs text-amber-400 max-w-[60px] sm:max-w-none">
                      {entry.song.title}
                    </span>
                    {onPlaySong && (
                      <button
                        onClick={() => isAnythingPlaying ? handlePreviewStop() : onPlaySong(entry.song)}
                        className={`flex-shrink-0 rounded-full p-0.5 sm:p-1 transition-colors ${
                          isAnythingPlaying
                            ? "bg-amber-700 text-amber-100 hover:bg-amber-600"
                            : "bg-amber-600/50 text-amber-200 hover:bg-amber-600"
                        }`}
                      >
                        {isAnythingPlaying ? (
                          <Square className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        ) : (
                          <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        )}
                      </button>
                    )}
                  </li>
                );
              })}
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
