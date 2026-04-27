// src/components/SongRequestBanner.tsx
import type { SelectedSong } from "@/types/jukebox";

type SongRequestBannerProps = {
  selectedSongs: SelectedSong[];
  onClick: () => void;
};

export function SongRequestBanner({ selectedSongs, onClick }: SongRequestBannerProps) {
  if (selectedSongs.length === 0) return null;

  const songTitles = selectedSongs.map((s) => s.title).join(", ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-amber-900/60 px-4 py-2 text-center text-sm text-amber-200 transition-colors hover:bg-amber-900/80"
    >
      <span className="font-semibold text-amber-400">Your song requests: </span>
      <span className="italic">{songTitles}</span>
      <span className="ml-2 text-xs text-amber-500">(tap to edit)</span>
    </button>
  );
}
