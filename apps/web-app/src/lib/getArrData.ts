import { RadarrMovie, SonarrEpisode, SonarrTV } from "@movies4discord/interfaces";
import { radarr, sonarr } from "./got";

export const checkEpisode = async (tvdbId: number, season: number, episode: number) => {
  const sonarrSeries = await sonarr
    .get(`series`, { searchParams: { tvdbId } })
    .json<SonarrTV[]>();

  if (!sonarrSeries[0]) {
    return {
      exists: false,
    };
  }

  const sonarrEpisodes = await sonarr
    .get(`episode`, { searchParams: { seriesId: sonarrSeries[0]!.id } })
    .json<SonarrEpisode[]>();

  const sonarrEpisode = sonarrEpisodes.find(
    (e) => e.seasonNumber === season && e.episodeNumber === episode
  );

  if (sonarrEpisode?.hasFile) {
    return {
      exists: true,
      episodeFileId: sonarrEpisode.episodeFileId,
      seriesTitle: sonarrSeries[0]!.title,
    };
  } else {
    return {
      exists: false,
    };
  }
};

export const checkMovie = async (tmdbId: number) => {
  const radarrMovies = await radarr
    .get(`movie`, { searchParams: { tmdbId } })
    .json<RadarrMovie[]>();

  if (radarrMovies[0]?.hasFile) {
    return {
      exists: true,
      title: radarrMovies[0]!.title,
      year: radarrMovies[0]!.year,
      path: radarrMovies[0]!.movieFile!.path,
    };
  } else {
    return {
      exists: false,
    };
  }
}