import { got } from "got";

export const tmdb = got.extend({
  prefixUrl: "https://api.themoviedb.org/3",
  searchParams: { api_key: process.env.TMDB_API_KEY! },
  // TODO: CACHE THIS
  // cache: tmdbCache,
});

export const podnapisi = got.extend({
  prefixUrl: "https://www.podnapisi.net",
  headers: { Accept: "application/json" },
  // TODO: CACHE THIS
  // cache: podnapisiCache,
});

export const radarr = got.extend({
  prefixUrl: `${process.env.RADARR_URL!.replace(/\/$/, "")}/api/v3`,
  searchParams: {
    apikey: process.env.RADARR_API_KEY!,
  },
});
