export interface SonarrEpisode {
  seriesId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: Date;
  airDateUtc: Date;
  hasFile: boolean;
  monitored: boolean;
  unverifiedSceneNumbering: boolean;
  id: number;
  overview?: string;
  absoluteEpisodeNumber?: number;
}
