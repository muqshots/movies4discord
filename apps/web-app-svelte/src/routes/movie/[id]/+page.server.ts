import { tmdb } from '$lib/utils/got';
import { formatMovieForThumbnail } from '$lib/utils/mediaFormat';
import type { MovieDetails, Images, Videos, Credits, Recommendations, MovieWithMediaType } from '@movies4discord/interfaces';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const okLanguages = ["en", "en-US", null];

  const id = params.id as string;

  let movieData;
  try {
    movieData = await tmdb
      .get(`movie/${id}`, {
        searchParams: {
          append_to_response: "images,videos,credits,recommendations",
          include_image_language: okLanguages.join(","),
          include_video_language: okLanguages.join(","),
        },
      })
      .json<
        MovieDetails & Images & Videos & Credits & Recommendations<MovieWithMediaType>
      >();
  } catch (e) {
    return {
      notFound: true,
      revalidate: 10,
    };
  }

  const backdropPath = movieData.backdrop_path;
  const posterPath =
    (movieData.images.posters[1] ?? movieData.images.posters[0])?.file_path ??
    null;
  const logoPath = movieData.images.logos[0]?.file_path ?? null;
  const ytKey =
    movieData.videos.results
      .filter((video) => video.site === "YouTube" && video.type === "Trailer")
      .sort((a) => (a.official ? -1 : 1))[0]?.key ?? null;

  const backdropUrl = `https://image.tmdb.org/t/p/original${backdropPath}`;
  const posterUrl = `https://image.tmdb.org/t/p/original${posterPath}`;
  const logoUrl = `https://image.tmdb.org/t/p/original${logoPath}`;


  return {
      id: movieData.id,
      isAvailable: false,
      title: movieData.title,
      overview: movieData.overview,
      poster: {
        url: posterUrl,
        b64: null,
      },
      backdrop: { url: backdropUrl, b64: null },
      logoUrl,
      ytKey,
      genres: movieData.genres.slice(0, 4),
      rating: movieData.vote_average,
      runtime: movieData.runtime ?? 0,
      releaseDate: movieData.release_date || null,
      cast: movieData.credits.cast.slice(0, 15).map((p) => ({
        name: p.name,
        id: p.id,
        image: `https://image.tmdb.org/t/p/original${p.profile_path}`,
        character: p.character,
      })),
      recommendations: await Promise.all(
        movieData.recommendations.results
          .filter(r => r.media_type === "movie")
          .slice(0, 15)
          .map(async (m) => formatMovieForThumbnail(m, false, true))
      ),
    revalidate: 604800, // Revalidate every week
  };
}) satisfies PageServerLoad;