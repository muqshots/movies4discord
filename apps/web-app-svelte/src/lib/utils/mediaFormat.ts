import { type MediaThumbnailProps } from "$lib/interfaces/media";
import type { CastMember, CrewMember, Movie, MovieDetails, SkyhookEpisode, TV, TVDetails } from "@movies4discord/interfaces";

export const formatMovieForThumbnail = async (
    movie: Movie | MovieDetails | CrewMember | CastMember,
    doPlaceholders: boolean,
    poster = false
  ): Promise<MediaThumbnailProps> => {
    const imageUrl = `https://image.tmdb.org/t/p/original/${poster ? movie.poster_path : movie.backdrop_path}`;
    return {
      media_type: "movie",
      id: movie.id,
      tvdbId: 0,
      season: 0,
      episode: 0,
      title: movie.title,
      image: {
        src: imageUrl,
        b64:
          // (imageUrl && doPlaceholders)
          //   ? (await getPlaiceholder(imageUrl)).base64: 
            null,
      },
      release_date: movie.release_date || null,
      rating: movie.vote_average,
    };
  };
  
  export const formatTVForThumbnail = async (
    tv: TV | TVDetails | CrewMember | CastMember,
    doPlaceholders: boolean,
    poster = false
  ): Promise<MediaThumbnailProps> => {
    const imageUrl = `https://image.tmdb.org/t/p/original/${poster ? tv.poster_path : tv.backdrop_path}`;
    return {
      media_type: "tv",
      id: tv.id,
      tvdbId: 0,
      season: 0,
      episode: 0,
      title: tv.name,
      image: {
        src: imageUrl,
        b64:
          // (imageUrl && doPlaceholders)
          //   ? (await getPlaiceholder(imageUrl)).base64: 
            null,
      },
      release_date: tv.first_air_date || null,
      rating: tv.vote_average,
    };
  };
  
  export const formatEpisodeforThumbnail = async (
    tmdbId: number,
    episode: SkyhookEpisode,
    // doPlaceholders: boolean,
    // poster = false
  ): Promise<Omit<MediaThumbnailProps, "media_type">> => {
    const imageUrl = episode.image ?? null;
  
    // let plaiceholder = null;
    // try {
    //   plaiceholder = (imageUrl && doPlaceholders) ? (await getPlaiceholder(imageUrl)).base64 : null
    // } catch (e) {
    //   console.log(e);
    // }
  
    return {
      id: tmdbId,
      tvdbId: episode.tvdbShowId,
      season: episode.seasonNumber,
      episode: episode.episodeNumber,
      title: `S${episode.seasonNumber}E${episode.episodeNumber} - ${episode.title}`,
      image: {
        src: imageUrl,
        b64: null
        // b64: plaiceholder
      },
      release_date: episode.airDate || null,
      rating: parseFloat(episode.rating?.value ?? "0"),
      overview: episode.overview
    };
  }