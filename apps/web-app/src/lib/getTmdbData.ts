import type {
  Episode,
  Movie,
  MovieDetails,
  MovieWithMediaType,
  PersonWithMediaType,
  RadarrMovie,
  SeasonDetails,
  TMDBListWrapper,
  TV,
  TVDetails,
  TVExternalIds,
  TVWithMediaType,
} from "@movies4discord/interfaces";
import { radarr, tmdb } from "@/lib/got";

const tmdbFetcher = async <T>(
  url: string,
  searchParams?: Record<string, string | number | boolean | null | undefined>
): Promise<T> => {
  return await tmdb.get(url, searchParams ? { searchParams } : {}).json<T>();
};

export const getPopularMovies = async (
  page?: number
) => {
  return (await tmdbFetcher<TMDBListWrapper<Movie>>(`movie/popular`, { page })).results;
};

export const getAvailablePopularMovies = async () => {
  // This is a somewhat inefficient method of getting the available movies 
  // since it has to make a request for each movie but radarr doesn't have bulk queries
  // and it doesn't matter too much since it's done in the background anyway
  let availableMovies: Movie[] = [], page = 1;

  while (availableMovies.length < 20) {
    const popularMovies = await getPopularMovies(page);
    const movieAvailability = await Promise.all(
      popularMovies.map(movie => 
        radarr
          .get("movie", { searchParams: { tmdbId: movie.id } })
          .json<RadarrMovie[]>()
      )
    );

    availableMovies = availableMovies.concat(popularMovies.filter((_, i) => movieAvailability[i]?.[0]?.hasFile ?? false));
    page++;
  }

  return availableMovies;
}

export const getPopularTV = async (
  page?: number
) => {
  return (await tmdbFetcher<TMDBListWrapper<TV>>(`tv/popular`, { page })).results;
};

export const getMovie = async (id: string | number) => {
  return await tmdbFetcher<MovieDetails>(`movie/${id}`, { append_to_response: "external_ids" });
};

export const getTV = async (id: string | number) => {
  return await tmdbFetcher<TVDetails & TVExternalIds>(`tv/${id}`, { append_to_response: "external_ids" });
};

export const getSeason = async (id: string | number, season: number) => {
  return await tmdbFetcher<SeasonDetails>(`tv/${id}/season/${season}`);
};

export const getEpisode = async (id: string | number, season: number, episode: number) => {
  return await tmdbFetcher<Episode>(`tv/${id}/season/${season}/episode/${episode}`, { append_to_response: "images" });
};

export const getMultiSearch = async (query: string) => {
  type ResultT = MovieWithMediaType | TVWithMediaType | PersonWithMediaType;
  return (
    await tmdbFetcher<TMDBListWrapper<ResultT>>("search/multi", { query })
  ).results;
};

export const getMoviesByGenre = async (genreId: string | number) => {
  return (
    await tmdbFetcher<TMDBListWrapper<Movie>>("discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
    })
  ).results;
};

export const getTVSByGenre = async (genreId: string | number) => {
  return (
    await tmdbFetcher<TMDBListWrapper<TV>>("discover/tv", {
      with_genres: genreId,
      sort_by: "popularity.desc",
    })
  ).results;
};
