// src/types/jukebox.ts

export type Song = {
  id: string;
  number: string;  // Display number like "154" or "A7"
  title: string;
  artist: string;
  year?: number;
};

export type QueueEntry = {
  id: string;
  name: string;
  song: Song;
  ticketNumber: string;
  timestamp: number;
};

export type WizardState =
  | "idle"
  | "song-selected"
  | "enter-name"
  | "playing"
  | "payment"
  | "complete";
