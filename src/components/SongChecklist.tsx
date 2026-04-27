// src/components/SongChecklist.tsx
import { useState, useMemo } from "react";
import { SONGS, songCode } from "@/data/songs";
import type { SelectedSong } from "@/types/jukebox";

type SongChecklistProps = {
  selectedSongs: SelectedSong[];
  onToggleSong: (song: SelectedSong) => void;
};

export function SongChecklist({ selectedSongs, onToggleSong }: SongChecklistProps) {
  const [filter, setFilter] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");

  const filterLower = filter.toLowerCase();

  const filteredSongs = useMemo(() => {
    return SONGS.map((song, idx) => ({ song, idx })).filter(({ song }) => {
      if (!filterLower) return true;
      return (
        song.title.toLowerCase().includes(filterLower) ||
        song.artist.toLowerCase().includes(filterLower)
      );
    });
  }, [filterLower]);

  const isSelected = (number: string) =>
    selectedSongs.some((s) => s.number === number);

  const isCustomSelected = selectedSongs.some((s) => s.kind === "custom");

  function handleCatalogToggle(absoluteIndex: number) {
    const song = SONGS[absoluteIndex];
    const code = songCode(absoluteIndex);
    onToggleSong({
      kind: "catalog",
      number: code,
      title: song.title,
      artist: song.artist,
    });
  }

  function handleRequestToggle() {
    if (isCustomSelected) {
      // Deselect: pass the current custom song so toggleSong removes it
      onToggleSong({
        kind: "custom",
        number: "L01",
        title: customTitle,
        artist: customArtist || undefined,
      });
    } else {
      // Select with current field values (may be empty — that's fine)
      onToggleSong({
        kind: "custom",
        number: "L01",
        title: customTitle,
        artist: customArtist || undefined,
      });
    }
  }

  function handleCustomTitleChange(value: string) {
    setCustomTitle(value);
    if (isCustomSelected) {
      onToggleSong({
        kind: "custom",
        number: "L01",
        title: value,
        artist: customArtist || undefined,
      });
    }
  }

  function handleCustomArtistChange(value: string) {
    setCustomArtist(value);
    if (isCustomSelected) {
      onToggleSong({
        kind: "custom",
        number: "L01",
        title: customTitle,
        artist: value || undefined,
      });
    }
  }

  // Separate the request entry from catalog songs
  const catalogItems = filteredSongs.filter(({ song }) => !song.isRequest);
  const requestItem = filteredSongs.find(({ song }) => song.isRequest);

  return (
    <div className="flex flex-col gap-2">
      {/* Filter input */}
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by title or artist..."
        className="w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-amber-600
          bg-neutral-900/80 border-amber-700/50 text-amber-100 placeholder:text-amber-700"
      />

      {/* Scrollable song list */}
      <div
        className="max-h-60 overflow-y-auto rounded-md border
          bg-neutral-950/50 border-amber-900/30"
      >
        {catalogItems.map(({ song, idx }) => {
          const code = songCode(idx);
          const selected = isSelected(code);
          return (
            <label
              key={code}
              className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors
                ${selected
                  ? "bg-amber-900/30 text-amber-100"
                  : "text-amber-300 hover:bg-amber-900/15"
                }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => handleCatalogToggle(idx)}
                className="accent-amber-500 shrink-0"
              />
              <span className="font-mono text-xs text-amber-500 shrink-0 w-8">{code}</span>
              <span className="truncate font-medium">{song.title}</span>
              <span className="ml-auto shrink-0 truncate text-xs text-amber-500/70">{song.artist}</span>
            </label>
          );
        })}

        {/* Request entry */}
        {requestItem && (
          <div
            className={`border-t transition-colors
              ${isCustomSelected
                ? "bg-rose-950/30 border-rose-800/40"
                : "border-amber-900/30"
              }`}
          >
            <label
              className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors
                ${isCustomSelected
                  ? "text-rose-200 hover:bg-rose-900/20"
                  : "text-amber-300 hover:bg-amber-900/15"
                }`}
            >
              <input
                type="checkbox"
                checked={isCustomSelected}
                onChange={handleRequestToggle}
                className="accent-rose-500 shrink-0"
              />
              <span className="font-mono text-xs shrink-0 w-8 text-rose-400/80">L01</span>
              <span className="font-medium">{requestItem.song.title}</span>
              <span className="ml-auto shrink-0 text-xs text-rose-400/60">{requestItem.song.artist}</span>
            </label>

            {/* Custom song fields — shown when request is selected */}
            {isCustomSelected && (
              <div className="flex flex-col gap-1.5 px-3 pb-2.5 pt-0.5">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => handleCustomTitleChange(e.target.value)}
                  placeholder="Song title (required)"
                  className="w-full rounded border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-rose-600
                    bg-neutral-900/80 border-rose-800/50 text-rose-100 placeholder:text-rose-700/70"
                />
                <input
                  type="text"
                  value={customArtist}
                  onChange={(e) => handleCustomArtistChange(e.target.value)}
                  placeholder="Artist (optional)"
                  className="w-full rounded border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-rose-600
                    bg-neutral-900/80 border-rose-800/50 text-rose-100 placeholder:text-rose-700/70"
                />
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {catalogItems.length === 0 && !requestItem && (
          <p className="px-3 py-4 text-center text-xs text-amber-600">
            No songs match &quot;{filter}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
