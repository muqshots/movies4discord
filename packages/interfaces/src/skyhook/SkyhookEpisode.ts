import { SkyhookRating } from "./SkyhookRating";

export interface SkyhookEpisode {
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
}