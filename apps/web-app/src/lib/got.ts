import { got, Options, Response } from "got";
import QuickLRU from "quick-lru";
import ResponseLike from "responselike";

const beforeReqHook = (lru: QuickLRU<string, string>) => (options: Options) => {
  const url = (options.url as URL).href;

  if (lru.has(url)) {
    return new ResponseLike(
      200,
      { "Content-Type": "application/json", "x-lru-cache": "oui" },
      Buffer.from(lru.get(url)!),
      url
    );
  }
};

const afterResponseHook =
  (lru: QuickLRU<string, string>) => (response: Response) => {
    if (!response.headers["x-lru-cache"]) {
      const url = response.requestUrl.href;
      lru.set(url, response.body as string);
    }
    return response;
  };

const arrLru = new QuickLRU<string, string>({
  maxSize: 99999,
  maxAge: 300000, // 5 minutes
});

const tmdbLru = new QuickLRU<string, string>({
  maxSize: 99999,
  maxAge: 604800000, // 1 week
});

export const tmdb = got.extend({
  prefixUrl: "https://api.themoviedb.org/3",
  searchParams: { api_key: process.env.TMDB_API_KEY! },
  hooks: {
    beforeRequest: [beforeReqHook(tmdbLru)],
    afterResponse: [afterResponseHook(tmdbLru)],
  },
});

export const podnapisi = got.extend({
  prefixUrl: "https://www.podnapisi.net",
  headers: { Accept: "application/json" },
  // is cached in api/subtitles.ts
});

export const radarr = got.extend({
  prefixUrl: `${process.env.RADARR_URL!.replace(/\/$/, "")}/api/v3`,
  searchParams: {
    apikey: process.env.RADARR_API_KEY!,
  },
  hooks: {
    beforeRequest: [beforeReqHook(arrLru)],
    afterResponse: [afterResponseHook(arrLru)],
  },
});

export const sonarr = got.extend({
  prefixUrl: `${process.env.SONARR_URL!.replace(/\/$/, "")}/api/v3`,
  searchParams: {
    apikey: process.env.SONARR_API_KEY!,
  },
  hooks: {
    beforeRequest: [beforeReqHook(arrLru)],
    afterResponse: [afterResponseHook(arrLru)],
  },
});

export const skyhook = got.extend({
  prefixUrl: `https://skyhook.sonarr.tv/v1/tvdb`,
  hooks: {
    beforeRequest: [beforeReqHook(arrLru)],
    afterResponse: [afterResponseHook(arrLru)],
  },
});
