import { SkyhookImage } from "./SkyhookImage";
import { SkyhookRating } from "./SkyhookRating";

export interface SkyhookShow {
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
  rating: SkyhookRating;
  actors: { name: string; character: string }[];
  images: SkyhookImage[];
  seasons: { seasonNumber: string; images: SkyhookImage[] }[];
  episodes: {
    tvdbShowId: number;
    tvdbId: number;
    seasonNumber: number;
    episodeNumber: number;
    title: string;
    airDate: string;
    airDateUtc: string;
    rating: SkyhookRating;
    overview: string;
    writers: string[];
    directors: string[];
    image: string;
  }[];
}
