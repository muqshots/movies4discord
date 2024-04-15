import { got, Options, type Response } from "got";
import QuickLRU from "quick-lru";
import ResponseLike from "responselike";

const beforeReqHook = (lru: QuickLRU<string, string>) => (options: Options) => {
  const url = (options.url as URL).href;

  if (lru.has(url)) {
    return new ResponseLike({
      statusCode: 200,
      headers: { "Content-Type": "application/json", "x-lru-cache": "oui" },
      body: Buffer.from(lru.get(url)!),
      url
    });
  }
};

const afterResponseHook =
  (lru: QuickLRU<string, string>) => (response: Response) => {
    if (!response.headers["x-lru-cache"]) {
      if (response.statusCode === 200) {
        const url = response.requestUrl.href;
        lru.set(url, response.body as string);
      }
    }
    return response;
  };

export const radarrLru = new QuickLRU<string, string>({
  maxSize: 99999,
  maxAge: 300000, // 5 minutes
});

const sonarrLru = new QuickLRU<string, string>({
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
  https: { rejectUnauthorized: false },
  // is cached in api/subtitles.ts
});

export const radarrPrefix = `${process.env.RADARR_URL!.replace(/\/$/,"")}/api/v3`;
export const radarr = got.extend({
  prefixUrl: radarrPrefix,
  searchParams: {
    apikey: process.env.RADARR_API_KEY!,
  },
  hooks: {
    beforeRequest: [beforeReqHook(radarrLru)],
    afterResponse: [afterResponseHook(radarrLru)],
  },
});

export const sonarr = got.extend({
  prefixUrl: `${process.env.SONARR_URL!.replace(/\/$/, "")}/api/v3`,
  searchParams: {
    apikey: process.env.SONARR_API_KEY!,
  },
  hooks: {
    beforeRequest: [beforeReqHook(sonarrLru)],
    afterResponse: [afterResponseHook(sonarrLru)],
  },
});

export const skyhook = got.extend({
  prefixUrl: `https://skyhook.sonarr.tv/v1/tvdb`,
  hooks: {
    beforeRequest: [beforeReqHook(sonarrLru)],
    afterResponse: [afterResponseHook(sonarrLru)],
  },
});

export const trakt = got.extend({
  prefixUrl: "https://api.trakt.tv",
  headers: {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    "trakt-api-key": process.env.TRAKT_ID!,
  },
  hooks: {
    afterResponse: [
      (response) => {
        if (response.statusCode === 429) {
          console.log(response.body);
        }
        return response;
      }
    ]
  }
});