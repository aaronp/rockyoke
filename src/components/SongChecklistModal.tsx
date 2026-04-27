// src/components/SongChecklistModal.tsx
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SongChecklist } from "@/components/SongChecklist";
import type { SelectedSong } from "@/types/jukebox";

type SongChecklistModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSongs: SelectedSong[];
  onToggleSong: (song: SelectedSong) => void;
};

export function SongChecklistModal({
  open,
  onOpenChange,
  selectedSongs,
  onToggleSong,
}: SongChecklistModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-amber-900/50 p-0 sm:max-w-md"
        style={{
          background:
            "linear-gradient(135deg, rgba(60, 20, 10, 0.98) 0%, rgba(40, 15, 8, 0.99) 50%, rgba(30, 10, 5, 0.98) 100%)",
          boxShadow:
            "inset 0 0 60px rgba(0, 0, 0, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.8)",
        }}
      >
        <DialogTitle className="sr-only">Edit Song Requests</DialogTitle>
        <DialogDescription className="sr-only">
          Choose which songs you would like to request
        </DialogDescription>

        <div className="flex flex-col p-6">
          <h2 className="mb-4 text-center text-lg font-bold uppercase tracking-wider text-amber-100">
            Your Song Requests
          </h2>
          <SongChecklist
            selectedSongs={selectedSongs}
            onToggleSong={onToggleSong}
          />
          <p className="mt-3 text-center text-[10px] italic text-amber-600">
            Song choices are requests only and not guaranteed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
