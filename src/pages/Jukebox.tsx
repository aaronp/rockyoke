// src/pages/Jukebox.tsx
import { useState, useCallback } from "react";
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
import type { Song } from "@/types/jukebox";
import backgroundImage from "../background.png";
import { EventPoster } from "@/components/EventPoster";
import { LineupPanel } from "@/components/LineupPanel";
import { HelpTooltip } from "@/components/HelpTooltip";
import { TicketModal } from "@/components/TicketModal";

const EVENT_DETAILS = {
  eventName: "Rockyoke Night!",
  venue: "The Mechanics",
  date: "2nd May",
  priceAdvance: "£12",
  priceDoor: "£15",
} as const;

export default function Jukebox() {
  const state = useJukeboxState();
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [needleDown, setNeedleDown] = useState(false);
  const [rolodexPage, setRolodexPage] = useState(0);
  const [codeInput, setCodeInput] = useState("");
  const [codeDisplayState, setCodeDisplayState] = useState<DisplayState>("normal");
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketsOwned, setTicketsOwned] = useState(0);
  const [previewingSong, setPreviewingSong] = useState<Song | null>(null);
  const totalPages = 11; // A-K

  // Calculate remaining sign-ups (tickets owned minus queue entries)
  const ticketsRemaining = ticketsOwned - state.queue.length;

  const handleBuyTickets = useCallback((quantity: number) => {
    setTicketsOwned(prev => prev + quantity);
  }, []);

  // Common action to play any song preview
  const handlePlaySong = useCallback((song: Song) => {
    setPreviewingSong(song);
    setPreviewPlaying(true);
    setNeedleDown(false);
  }, []);

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
    setPreviewingSong(null);
  }, []);

  const handleNeedleDown = useCallback(() => {
    setNeedleDown(true);
  }, []);

  return (
    <div
      className="relative min-h-screen text-neutral-100 overflow-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-neutral-950/80" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Narrow screens: Banner at top */}
        <div className="lg:hidden">
          <EventPoster
            {...EVENT_DETAILS}
            variant="banner"
          />
        </div>

        {/* Grid layout */}
        <div className="grid min-h-screen grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1fr_max-content_1fr] lg:items-center lg:py-2">
          {/* Wide screens: Poster on left */}
          <div className="hidden lg:flex lg:justify-end lg:self-center">
            <div className="w-[280px]">
              <EventPoster
                {...EVENT_DETAILS}
                variant="poster"
                onBuyTickets={() => setTicketModalOpen(true)}
              />
            </div>
          </div>

          {/* Jukebox (center) - fixed size, no shrink */}
          <div className="flex flex-shrink-0 items-center justify-center">
            <div className="relative w-[800px]">
              <HelpTooltip />
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
                  onSelectSong={(song) => {
                    state.selectSong(song);
                    setCodeInput(song.number);
                  }}
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
                  onBuyTickets={() => setTicketModalOpen(true)}
                  ticketsRemaining={ticketsRemaining}
                  previewingSong={previewingSong}
                  onPlaySong={handlePlaySong}
                />
              }
              />
            </div>
          </div>

          {/* Queue panel (right on wide, bottom on narrow) */}
          <div className="lg:flex lg:justify-start lg:self-center">
            <div className="w-full lg:w-[280px]">
              <LineupPanel
                queue={state.queue}
                variant="panel"
                className="hidden lg:flex lg:h-[600px]"
                onBuyTickets={() => setTicketModalOpen(true)}
                onPlaySong={handlePlaySong}
                playingSongId={previewingSong?.number}
              />
              <LineupPanel
                queue={state.queue}
                variant="section"
                className="lg:hidden"
                onBuyTickets={() => setTicketModalOpen(true)}
                onPlaySong={handlePlaySong}
                playingSongId={previewingSong?.number}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        {...EVENT_DETAILS}
        ticketsOwned={ticketsOwned}
        ticketsRemaining={ticketsRemaining}
        onBuyTickets={handleBuyTickets}
      />
    </div>
  );
}
