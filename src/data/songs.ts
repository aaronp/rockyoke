import type { Song } from "@/types/jukebox";

export type InternalSong = {
  no: number;
  title: string;
  artist: string;
  year: number;
  isRequest?: boolean;  // Special "request your own song" entry
};

export type PageEntry = { song: InternalSong; absoluteIndex: number };

export const SONGS: InternalSong[] = [
  { no: 1, title: "Hard To Handle", artist: "The Black Crowes", year: 1990 },
  { no: 2, title: "In The Morning", artist: "Razorlight", year: 2006 },
  { no: 3, title: "Dakota", artist: "Stereophonics", year: 2005 },
  { no: 4, title: "No One Knows", artist: "Queens of the Stone Age", year: 2002 },
  { no: 5, title: "Hush", artist: "Kula Shaker", year: 1997 },
  { no: 6, title: "The Riverboat Song", artist: "Ocean Colour Scene", year: 1996 },
  { no: 7, title: "Mustang Sally", artist: "The Commitments", year: 1991 },
  { no: 8, title: "Take Me Home, Country Roads", artist: "John Denver", year: 1971 },
  { no: 9, title: "Alright", artist: "Supergrass", year: 1995 },
  { no: 10, title: "Are You Gonna Be My Girl", artist: "Jet", year: 2003 },
  { no: 11, title: "Long Cool Woman (In a Black Dress)", artist: "The Hollies", year: 1972 },
  { no: 12, title: "Heavyweight Champion of the World", artist: "Reverend And The Makers", year: 2007 },
  { no: 13, title: "My Hero", artist: "Foo Fighters", year: 1997 },
  { no: 14, title: "Zombie", artist: "The Cranberries", year: 1994 },
  { no: 15, title: "Jamming", artist: "Bob Marley & The Wailers", year: 1977 },
  { no: 16, title: "I Don't Like Cricket (I Love It)", artist: "10cc", year: 1979 },
  { no: 17, title: "Seventeen Going Under", artist: "Sam Fender", year: 2021 },
  { no: 18, title: "Master Blaster (Jammin')", artist: "Stevie Wonder", year: 1980 },
  { no: 19, title: "Could You Be Loved", artist: "Bob Marley & The Wailers", year: 1980 },
  { no: 20, title: "You Make My Dreams (Come True)", artist: "Hall & Oates", year: 1980 },
  { no: 21, title: "Morning Glory", artist: "Oasis", year: 1995 },
  { no: 22, title: "Summer Of '69", artist: "Bryan Adams", year: 1984 },
  { no: 23, title: "Gay Bar", artist: "Electric Six", year: 2003 },
  { no: 24, title: "Sweet Child O' Mine", artist: "Guns N' Roses", year: 1987 },
  { no: 25, title: "Fat Bottomed Girls", artist: "Queen", year: 1978 },
  { no: 26, title: "Don't Stop Believin'", artist: "Journey", year: 1981 },
  { no: 27, title: "Tribute", artist: "Tenacious D", year: 2001 },
  { no: 28, title: "All The Small Things", artist: "blink-182", year: 1999 },
  { no: 29, title: "Sir Duke", artist: "Stevie Wonder", year: 1976 },
  { no: 30, title: "Kids", artist: "MGMT", year: 2007 },
  { no: 31, title: "The Chain", artist: "Fleetwood Mac", year: 1977 },
  { no: 32, title: "Dreams", artist: "Fleetwood Mac", year: 1977 },
  { no: 33, title: "Landslide", artist: "Fleetwood Mac", year: 1975 },
  { no: 34, title: "Lovely Day", artist: "Bill Withers", year: 1977 },
  { no: 35, title: "Paradise City", artist: "Guns N' Roses", year: 1987 },
  { no: 36, title: "Tombstone", artist: "Ocean Alley", year: 2018 },
  { no: 37, title: "Two Princes", artist: "Spin Doctors", year: 1991 },
  { no: 38, title: "Don't Look Back In Anger", artist: "Oasis", year: 1996 },
  { no: 39, title: "All Right Now", artist: "Free", year: 1970 },
  { no: 40, title: "I'm Gonna Be (500 Miles)", artist: "The Proclaimers", year: 1988 },
  { no: 41, title: "Valerie", artist: "The Zutons", year: 2006 },
  { no: 42, title: "The Gambler", artist: "Kenny Rogers", year: 1978 },
  { no: 43, title: "Seven Nation Army", artist: "The White Stripes", year: 2003 },
  { no: 44, title: "Dammit", artist: "blink-182", year: 1997 },
  { no: 45, title: "The Middle", artist: "Jimmy Eat World", year: 2001 },
  { no: 46, title: "American Idiot", artist: "Green Day", year: 2004 },
  { no: 47, title: "Everything About You", artist: "Ugly Kid Joe", year: 1991 },
  { no: 48, title: "Figure It Out", artist: "Royal Blood", year: 2014 },
  { no: 49, title: "Black Chandelier", artist: "Biffy Clyro", year: 2013 },
  { no: 50, title: "Holiday", artist: "Green Day", year: 2004 },
  { no: 51, title: "All My Life", artist: "Foo Fighters", year: 2002 },
  { no: 52, title: "Basket Case", artist: "Green Day", year: 1994 },
  { no: 53, title: "Personal Jesus", artist: "Depeche Mode", year: 1989 },
  { no: 54, title: "What's The Frequency, Kenneth?", artist: "R.E.M.", year: 1994 },
  { no: 55, title: "You Really Got Me", artist: "Van Halen", year: 1978 },
  { no: 56, title: "Peaches", artist: "The Presidents Of The USA", year: 1995 },
  { no: 57, title: "My Own Worst Enemy", artist: "Lit", year: 1999 },
  { no: 58, title: "Rock and Roll", artist: "Led Zeppelin", year: 1971 },
  { no: 59, title: "Long Train Runnin'", artist: "The Doobie Brothers", year: 1973 },
  { no: 60, title: "Vertigo", artist: "U2", year: 2004 },
  { no: 61, title: "Plug in Baby", artist: "Muse", year: 2001 },
  { no: 62, title: "Hysteria", artist: "Muse", year: 2003 },
  { no: 63, title: "You're All I Have", artist: "Snow Patrol", year: 2006 },
  { no: 64, title: "Message In A Bottle", artist: "The Police", year: 1979 },
  { no: 65, title: "Sex on Fire", artist: "Kings of Leon", year: 2008 },
  { no: 66, title: "A New Beginning", artist: "Good Charlotte", year: 2000 },
  // Special request entry - always last
  { no: 99, title: "Request a Song", artist: "Your choice!", year: 0, isRequest: true },
];

/** Compute song code from absolute index in the master SONGS list */
export function songCode(absoluteIndex: number): string {
  const pageIdx = Math.floor(absoluteIndex / 6);
  const posInPage = absoluteIndex % 6;
  const letter = String.fromCharCode(65 + pageIdx);
  return `${letter}${String(posInPage + 1).padStart(2, '0')}`;
}

// Build a single lookup map from code → Song, used by both display and input
export const SONG_BY_CODE: Record<string, Song> = {};
SONGS.forEach((internal, absoluteIndex) => {
  const code = songCode(absoluteIndex);
  SONG_BY_CODE[code] = {
    id: code,
    number: code,
    title: internal.title,
    artist: internal.artist,
    year: internal.year,
    isRequest: internal.isRequest,
  };
});

export function findSongByCode(code: string): Song | null {
  return SONG_BY_CODE[code.toUpperCase()] ?? null;
}

export function getTotalPages(variant: "large" | "small" = "large"): number {
  const songsPerRow = variant === "small" ? 2 : 3;
  const perPage = songsPerRow * 2;
  return Math.ceil(SONGS.length / perPage);
}
