import { getSkyhookTV } from "@/lib/getSkyhookData";
import { sonarr } from "@/lib/got";
import { SkyhookEpisode, SonarrEpisode, SonarrTV } from "@movies4discord/interfaces";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@movies4discord/db";

export interface GetShow {
  episodes: {
    id: number;
    title: string;
    image: string | null;
    overview: string | null;
    seasonNumber: number;
    episodeNumber: number;
    airDate: string | null;
    rating: string | null;

    available: boolean;
  }[];

  seasons: number[];
}

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<GetShow | { error: string }>
) => {
  const session = await getSession({ req: _req });

  let check = null
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

  const tvdbId = parseInt(_req.query.tvdbId as string);
  if (Number.isNaN(tvdbId)) {
    res.status(422).json({ error: "gib tvdb" });
  }

  const [showData, sonarrData] = await Promise.all([
    getSkyhookTV(tvdbId).catch((e) => ({ episodes: [], seasons: [] })),
    sonarr
      .get(`series`, { searchParams: { tvdbId } })
      .json<SonarrTV[]>()
      .catch((e) => []),
  ]);
  const sonarrId = sonarrData[0]?.id;

  let sonarrEpisodes: SonarrEpisode[];
  if (sonarrId) {
    sonarrEpisodes = await sonarr
      .get(`episode`, { searchParams: { seriesId: sonarrId } })
      .json<SonarrEpisode[]>();
  } else {
    sonarrEpisodes = [];
  }

  const seasons = showData.seasons
    .filter((e) => {
      if (e.seasonNumber === 0) {
        return sonarrData[0]?.seasons[0]?.statistics.episodeFileCount || 0 > 0;
      }
      return true;
    })
    .map((s) => s.seasonNumber);

  const episodes = (showData.episodes as SkyhookEpisode[])
    .reduce((result, e) => {
      const sonarrEpisode = sonarrEpisodes.find(
        (sE) =>
          e.seasonNumber === sE.seasonNumber &&
          e.episodeNumber === sE.episodeNumber
      );

      if (e.seasonNumber === 0 && !sonarrEpisode?.hasFile) {
        return result;
      }

      result.push({
        id: e.tvdbId,
        title: e.title,
        image: e.image ?? null,
        overview: e.overview ?? null,
        seasonNumber: e.seasonNumber,
        episodeNumber: e.episodeNumber,
        airDate: e.airDate ?? null,
        rating: e.rating?.value ?? null,

        available: sonarrEpisode?.hasFile ?? false,
      });

      return result;
    }, [] as GetShow["episodes"]);

  res.status(200).json({ episodes, seasons });
};

export default handler;
