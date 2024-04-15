import { discoverTV, getPopularMovies } from '$lib/utils/getTmdbData';
import type { PageServerLoad } from './$types';
import { formatTVForThumbnail, formatMovieForThumbnail } from '$lib/utils/mediaFormat';

export const load = (async () => {
  const sliders = [];

  sliders.push({
    text: "Popular movies",
    media_type: "movie" as const,
    media: await Promise.all(
      (await getPopularMovies())
        .slice(0, 15)
        .map(async (movie) => formatMovieForThumbnail(movie, false, true))
    ),
  });

  sliders.push({
    text: "Popular TV",
    media_type: "tv" as const,
    media: await Promise.all(
      (await discoverTV())
        .slice(0, 15)
        .map(async (tv) => formatTVForThumbnail(tv, false, true))
    ),
  });

    // 2.
    return { sliders: sliders };
}) satisfies PageServerLoad;