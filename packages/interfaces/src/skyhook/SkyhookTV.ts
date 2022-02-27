import { SkyhookImage } from "./SkyhookImage";
import { SkyhookRating } from "./SkyhookRating";

export interface SkyhookTV {
  tvdbId: number;
  title: string;
  overview: string;
  slug: string;
  firstAired: string;
  tvRageId: number;
  tvMazeId: number;
  added: string;
  status: string;
  lastUpdated: string;
  runtime: number;
  timeOfDay: { hours: number; minutes: number };
  network: string;
  imdbId: string;
  genres: string[];
  contentRating: string;
  rating?: SkyhookRating;
  actors: { name: string; character: string }[];
  images: SkyhookImage[];
  seasons: { seasonNumber: number; images: SkyhookImage[] }[];
  episodes: {
    tvdbShowId: number;
    tvdbId: number;
    seasonNumber: number;
    episodeNumber: number;
    airedBeforeSeasonNumber?: number;
    airedBeforeEpisodeNumber?: number;
    airedAfterSeasonNumber?: number;
    title: string;
    airDate?: string;
    airDateUtc?: string;
    overview?: string;
    image?: string;
    absoluteEpisodeNumber?: number;
    rating?: SkyhookRating;
    writers?: string[];
    directors?: string[];
    guestStars?: string[];
  }[];
}
