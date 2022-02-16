import { MediaThumbnailProps } from "@/components/MediaThumbnail";
import { Movie, MovieDetails, TV, TVDetails } from "@movies4discord/interfaces";
import { getPlaiceholder } from "plaiceholder";
import { getImageUrl } from "./getImageUrl";

export const formatMovieForThumbnail = async (
  movie: Movie | MovieDetails,
  doPlaceholders: boolean,
  poster = false
): Promise<Omit<MediaThumbnailProps, "media_type">> => {
  const imageUrl = getImageUrl(
    poster ? movie.poster_path : movie.backdrop_path
  );
  return {
    id: movie.id,
    title: movie.title,
    image: {
      src: imageUrl,
      b64:
        imageUrl && doPlaceholders
          ? (await getPlaiceholder(imageUrl)).base64
          : null,
    },
    release_date: movie.release_date || null,
    rating: movie.vote_average,
  };
};

export const formatTVForThumbnail = async (
  tv: TV | TVDetails,
  doPlaceholders: boolean,
  poster = false
): Promise<Omit<MediaThumbnailProps, "media_type">> => {
  const imageUrl = getImageUrl(poster ? tv.poster_path : tv.backdrop_path);
  return {
    id: tv.id,
    title: tv.name,
    image: {
      src: imageUrl,
      b64:
        imageUrl && doPlaceholders
          ? (await getPlaiceholder(imageUrl)).base64
          : null,
    },
    release_date: tv.first_air_date || null,
    rating: tv.vote_average,
  };
};
