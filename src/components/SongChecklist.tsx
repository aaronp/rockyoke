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

  const selectedNumbers = useMemo(
    () => new Set(selectedSongs.map((s) => s.number)),
    [selectedSongs],
  );

  const isCustomSelected = selectedSongs.some((s) => s.kind === "custom");

  // Build catalog items (exclude request entry), then split into selected pinned + rest
  const catalogItems = useMemo(() => {
    return SONGS.map((song, idx) => ({ song, idx })).filter(({ song }) => !song.isRequest);
  }, []);

  const filteredCatalog = useMemo(() => {
    if (!filterLower) return catalogItems;
    return catalogItems.filter(
      ({ song }) =>
        song.title.toLowerCase().includes(filterLower) ||
        song.artist.toLowerCase().includes(filterLower),
    );
  }, [filterLower, catalogItems]);

  // Split into pinned (selected) and unpinned, preserving order within each group
  const pinnedItems = useMemo(
    () => filteredCatalog.filter(({ idx }) => selectedNumbers.has(songCode(idx))),
    [filteredCatalog, selectedNumbers],
  );
  const unpinnedItems = useMemo(
    () => filteredCatalog.filter(({ idx }) => !selectedNumbers.has(songCode(idx))),
    [filteredCatalog, selectedNumbers],
  );

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
    onToggleSong({
      kind: "custom",
      number: "L01",
      title: customTitle || "Request a Song",
      artist: customArtist || undefined,
    });
  }

  function handleCustomTitleChange(value: string) {
    setCustomTitle(value);
    if (isCustomSelected) {
      onToggleSong({
        kind: "custom",
        number: "L01",
        title: value || "Request a Song",
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
        title: customTitle || "Request a Song",
        artist: value || undefined,
      });
    }
  }

  function renderRow(idx: number, selected: boolean) {
    const song = SONGS[idx];
    const code = songCode(idx);
    return (
      <label
        key={code}
        className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-base transition-colors
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
        <span className="font-mono text-sm text-amber-500 shrink-0 w-10">{code}</span>
        <span className="truncate font-medium">{song.title}</span>
        <span className="ml-auto shrink-0 truncate text-sm text-amber-500/70">{song.artist}</span>
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Filter input */}
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by title or artist..."
        className="w-full rounded-md border px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-amber-600
          bg-neutral-900/80 border-amber-700/50 text-amber-100 placeholder:text-amber-700"
      />

      {/* Scrollable song list */}
      <div
        className="max-h-80 overflow-y-auto rounded-md border
          bg-neutral-950/50 border-amber-900/30"
      >
        {/* Pinned selected songs at top */}
        {pinnedItems.length > 0 && (
          <>
            {pinnedItems.map(({ idx }) => renderRow(idx, true))}
            {unpinnedItems.length > 0 && (
              <div className="h-px bg-amber-700/30" />
            )}
          </>
        )}

        {/* Remaining unselected songs */}
        {unpinnedItems.map(({ idx }) => renderRow(idx, false))}

        {/* Empty state */}
        {filteredCatalog.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-amber-600">
            No songs match &quot;{filter}&quot;
          </p>
        )}
      </div>

      {/* Request a Song — separate from the list */}
      <div
        className={`rounded-md border transition-colors ${
          isCustomSelected
            ? "bg-rose-950/30 border-rose-700/40"
            : "border-amber-900/30 bg-neutral-950/50"
        }`}
      >
        <label
          className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-base transition-colors ${
            isCustomSelected
              ? "text-rose-200"
              : "text-amber-300 hover:bg-amber-900/15"
          }`}
        >
          <input
            type="checkbox"
            checked={isCustomSelected}
            onChange={handleRequestToggle}
            className="accent-rose-500 shrink-0"
          />
          <span className="font-medium">
            {isCustomSelected ? "Custom Song Request" : "Request a Song"}
          </span>
          {!isCustomSelected && (
            <span className="ml-auto shrink-0 text-sm text-amber-500/70">Your choice!</span>
          )}
        </label>

        {isCustomSelected && (
          <div className="flex flex-col gap-1.5 px-3 pb-3 pt-0.5">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => handleCustomTitleChange(e.target.value)}
              placeholder="Song title"
              className="w-full rounded border px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-rose-600
                bg-neutral-900/80 border-rose-800/50 text-rose-100 placeholder:text-rose-700/70"
            />
            <input
              type="text"
              value={customArtist}
              onChange={(e) => handleCustomArtistChange(e.target.value)}
              placeholder="Artist (optional)"
              className="w-full rounded border px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-rose-600
                bg-neutral-900/80 border-rose-800/50 text-rose-100 placeholder:text-rose-700/70"
            />
          </div>
        )}
      </div>
    </div>
  );
}
