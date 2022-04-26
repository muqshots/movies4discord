import { getQuery } from "@/lib/getQuery";
import { podnapisi } from "@/lib/got";
import { srtToVtt } from "@/lib/srtToVtt";
import { PodnapisiResults } from "@movies4discord/interfaces";
import AdmZip from "adm-zip";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import QuickLRU from "quick-lru";
import { prisma } from "@movies4discord/db";

const subsCache = new QuickLRU<string, string>({ maxSize: 1000 });

// params
// q: Title of movie/tv. required
// t: "movie"/"tv". required
// language: language to get subs eg. "en". required
// year: year of movie/tv. optional
// season: season of tv. required if t is "tv"
// episode: episode of tv. required if t is "tv"
const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<string | { error: string }>
) => {
  const session = await getSession({ req: _req });
  var check = null
  if (!session && !_req.query.id) {
    res.status(401).json({ error: "Unauthorized..." });
    return;
  }
  else if (_req.query.id) {
    check = await prisma.user.findUnique({
      where: {
        id: _req.query.id as string
      }
    })
    if (!check) {
      res.status(401).json({ error: "Unauthorized..." });
      return;
    }
  }

  let { q, t, season, episode, year, language } = _req.query;
  q = getQuery(q);
  t = getQuery(t);
  season = getQuery(season);
  episode = getQuery(episode);
  language = getQuery(language);
  year = getQuery(year);

  if (!q || !t || !language || (t !== "movie" && t !== "tv")) {
    res.status(422).json({
      error: "You didn't gib info",
    });
    return;
  }

  let params = {
    keywords: q,
    language,
  } as Record<string, string>;
  if (year) {
    params = { ...params, year };
  }
  if (t === "movie") {
    params.movie_type === "movie";
  }
  if (t === "tv") {
    if (!season || !episode) {
      res.status(422).json({
        error: "You didn't gib info",
      });
      return;
    }
    params.media_type === "tv-series";
    params.seasons = season;
    params.episodes = episode;
  }

  const queryKey = JSON.stringify(params);
  if (subsCache.has(queryKey)) {
    res.status(200).send(subsCache.get(queryKey)!);
    return;
  }
  const results = await podnapisi
    .get("en/subtitles/search", { searchParams: params })
    .json<PodnapisiResults>();

  const subThing = results.data.sort(
    (a, b) => b.stats.downloads - a.stats.downloads
  )[0];

  if (!subThing) {
    res.status(404).json({
      error: "No subtitles found",
    });
    return;
  }

  const downloadUrl = subThing.download.slice(1); // remove leading slash

  const zipBuffer = await podnapisi
    .get(downloadUrl)
    .buffer()
    .catch((e) => ({ error: true, message: e.response.body as string }));

  if (!Buffer.isBuffer(zipBuffer)) {
    return res.status(500).json({ error: zipBuffer.message });
  }

  const zip = new AdmZip(zipBuffer);
  const file = zip.getEntries()[0];

  if (!file) {
    res.status(404).json({
      error: "No subtitles found",
    });
    return;
  }

  let vttSub;
  try {
    vttSub = await new Promise<string>((resolve) => {
      file.getDataAsync((buffer) => {
        const srtSub = buffer.toString("utf8");
        const vtt = srtToVtt(srtSub);
        resolve(vtt);
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Could not convert" });
    return;
  }

  res
    .status(200)
    .setHeader("Content-Disposition", `attachment; filename=${q}.vtt`)
    .setHeader("Content-Type", "text/vtt")
    // .setHeader("Cache-Control", "max-age=604800")
    .send(vttSub);

  subsCache.set(queryKey, vttSub);
};

export default handler;
