// src/pages/Jukebox.tsx
import { useState, useCallback, useEffect } from "react";
import {
  JukeboxShell,
  Wurlitzer,
  Rolodex,
  SignUpWizard,
  ButtonPanel,
} from "@/components/jukebox";
import { findSongByCode, getTotalPages } from "@/data/songs";
import { useJukeboxState } from "@/hooks/useJukeboxState";
import { useTickets } from "@/hooks/useTickets";
import type { DisplayState } from "@/components/jukebox/ButtonPanel";
import type { Song } from "@/types/jukebox";
import backgroundImage from "../background.png";
import { EventPoster } from "@/components/EventPoster";
import { LineupPanel } from "@/components/LineupPanel";
import { HelpTooltip } from "@/components/HelpTooltip";
import { TicketModal } from "@/components/TicketModal";
import { TicketConfirmationModal } from "@/components/TicketConfirmationModal";

const EVENT_DETAILS = {
  eventName: "Rockyoke Night!",
  venue: "The VeeCee",
  date: "20th June",
  priceAdvance: "£12",
  priceDoor: "£15",
} as const;

export default function Jukebox() {
  const state = useJukeboxState();
  const { ticketIds, ticketCount, pendingConfirmation, clearPendingConfirmation } = useTickets();
  const [isViewingTickets, setIsViewingTickets] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [needleDown, setNeedleDown] = useState(false);
  const [rolodexPage, setRolodexPage] = useState(0);
  const [codeInput, setCodeInput] = useState("");
  const [codeDisplayState, setCodeDisplayState] = useState<DisplayState>("normal");
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [previewingSong, setPreviewingSong] = useState<Song | null>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const variant = isMobile ? "small" : "large";
  const totalPages = getTotalPages(variant);

  // Detect mobile screen size for Wurlitzer variant
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show confirmation modal for new purchases (from OrderComplete redirect)
  useEffect(() => {
    if (pendingConfirmation && ticketIds.length > 0) {
      setIsViewingTickets(false);
      setConfirmationModalOpen(true);
      clearPendingConfirmation();
    }
  }, [pendingConfirmation, ticketIds.length, clearPendingConfirmation]);

  // Calculate remaining sign-ups (tickets owned minus queue entries)
  const ticketsRemaining = ticketCount - state.queue.length;

  // Handle ticket button click - view tickets if owned, otherwise buy
  const handleTicketButtonClick = useCallback(() => {
    if (ticketCount > 0) {
      setIsViewingTickets(true); // No confetti, just viewing
      setConfirmationModalOpen(true);
    } else {
      setTicketModalOpen(true);
    }
  }, [ticketCount]);

  // Handle "Buy More" from the tickets modal
  const handleBuyMoreTickets = useCallback(() => {
    setTicketModalOpen(true);
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
  // Reset when not playing (works for both song-selected state and queue previews)
  const shouldTriggerReset = !shouldTriggerPlay;

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
      className="relative min-h-screen text-neutral-100 overflow-x-hidden overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-neutral-950/80" />

      {/* Searchlight effect when music is playing (synced with needle drop) */}
      {needleDown && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Beam 1 - from top left */}
          <div
            className="absolute opacity-25"
            style={{
              width: "200px",
              height: "150vh",
              background: "linear-gradient(180deg, rgba(251, 191, 36, 0.5) 0%, rgba(251, 191, 36, 0.2) 30%, transparent 100%)",
              top: "0",
              left: "15%",
              transformOrigin: "top center",
              clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
              animation: "searchlight1 4s ease-in-out infinite",
            }}
          />
          {/* Beam 2 - from top right */}
          <div
            className="absolute opacity-20"
            style={{
              width: "180px",
              height: "150vh",
              background: "linear-gradient(180deg, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0.15) 30%, transparent 100%)",
              top: "0",
              right: "20%",
              transformOrigin: "top center",
              clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
              animation: "searchlight2 5s ease-in-out infinite",
            }}
          />
          {/* Beam 3 - from top center-left */}
          <div
            className="absolute opacity-15"
            style={{
              width: "160px",
              height: "140vh",
              background: "linear-gradient(180deg, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 100%)",
              top: "0",
              left: "35%",
              transformOrigin: "top center",
              clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
              animation: "searchlight3 6s ease-in-out infinite",
            }}
          />
          {/* Beam 4 - from top center-right */}
          <div
            className="absolute opacity-15"
            style={{
              width: "140px",
              height: "130vh",
              background: "linear-gradient(180deg, rgba(251, 191, 36, 0.35) 0%, rgba(251, 191, 36, 0.1) 35%, transparent 100%)",
              top: "0",
              right: "35%",
              transformOrigin: "top center",
              clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
              animation: "searchlight4 7s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes searchlight1 {
              0%, 100% { transform: rotate(-25deg); }
              50% { transform: rotate(15deg); }
            }
            @keyframes searchlight2 {
              0%, 100% { transform: rotate(20deg); }
              50% { transform: rotate(-20deg); }
            }
            @keyframes searchlight3 {
              0%, 100% { transform: rotate(-10deg); opacity: 0.15; }
              50% { transform: rotate(25deg); opacity: 0.2; }
            }
            @keyframes searchlight4 {
              0%, 100% { transform: rotate(15deg); opacity: 0.15; }
              50% { transform: rotate(-15deg); opacity: 0.2; }
            }
          `}</style>
        </div>
      )}

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
        <div className="grid min-h-screen grid-cols-1 gap-0 py-0 sm:gap-4 sm:px-4 sm:py-4 lg:grid-cols-[1fr_max-content_1fr] lg:items-center lg:py-2">
          {/* Wide screens: Poster on left */}
          <div className="hidden lg:flex lg:justify-end lg:self-center">
            <div className="w-[280px]">
              <EventPoster
                {...EVENT_DETAILS}
                variant="poster"
                onBuyTickets={handleTicketButtonClick}
                ticketsOwned={ticketCount}
              />
            </div>
          </div>

          {/* Jukebox (center) - full viewport width on mobile */}
          <div className="w-screen sm:w-full sm:flex sm:items-center sm:justify-center">
            <div className="relative w-full sm:max-w-[800px] sm:px-4 lg:w-[800px] lg:px-0">
              <HelpTooltip />
              <JukeboxShell
                variant={isMobile ? "small" : "large"}
                recordPlayer={
                  <Wurlitzer
                    triggerPlay={shouldTriggerPlay}
                    triggerReset={shouldTriggerReset}
                    onPlayComplete={previewPlaying ? undefined : state.onPlayComplete}
                    onReset={state.reset}
                    onNeedleDown={previewPlaying ? handleNeedleDown : undefined}
                    showControls={state.wizardState === "idle"}
                    variant={isMobile ? "small" : "large"}
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
                    variant={isMobile ? "small" : "large"}
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
                    onBuyTickets={handleTicketButtonClick}
                    ticketsRemaining={ticketsRemaining}
                    ticketsOwned={ticketCount}
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
                onBuyTickets={handleTicketButtonClick}
                onPlaySong={handlePlaySong}
                onStopSong={handlePreviewEnd}
                playingSongId={previewingSong?.number}
                ticketsOwned={ticketCount}
              />
              <LineupPanel
                queue={state.queue}
                variant="section"
                className="lg:hidden"
                onBuyTickets={handleTicketButtonClick}
                onPlaySong={handlePlaySong}
                onStopSong={handlePreviewEnd}
                playingSongId={previewingSong?.number}
                ticketsOwned={ticketCount}
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
        ticketsOwned={ticketCount}
        ticketsRemaining={ticketsRemaining}
      />

      {/* Ticket Confirmation Modal (with confetti for new purchases, without for viewing) */}
      <TicketConfirmationModal
        open={confirmationModalOpen}
        onOpenChange={setConfirmationModalOpen}
        ticketIds={ticketIds}
        showConfetti={!isViewingTickets}
        ticketsRemaining={ticketsRemaining}
        onBuyMore={handleBuyMoreTickets}
      />
    </div>
  );
}
