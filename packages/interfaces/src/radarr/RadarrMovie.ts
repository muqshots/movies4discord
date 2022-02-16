import { RadarrAlternateTitle } from "./RadarrAlternateTitle";
import { RadarrCollection } from "./RadarrCollection";
import { RadarrImage } from "./RadarrImage";
import { RadarrRating } from "./RadarrRating";

export interface RadarrMovie {
  id?: number;
  title: string;
  originalTitle: string;
  alternateTitles: RadarrAlternateTitle[];
  secondaryYearSourceId: number;
  sortTitle: string;
  sizeOnDisk: number;
  overview: string;
  inCinemas?: string;
  physicalRelease?: string;
  images: RadarrImage[];
  website: string;
  year: number;
  hasFile: boolean;
  youtubeTrailerId: string;
  studio: string;
  path?: string;
  rootFolderPath?: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: "announced" | "inCinema" | "released" | "tba";
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId?: string;
  tmdbId: number;
  titleSlug: string;
  certification?: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: RadarrRating;
  collection?: RadarrCollection;
  status: "deleted" | "tba" | "announced" | "inCinema" | "released";
  // TODO: Add more fields
  movieFile?: { path: string };
}
