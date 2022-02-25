import { MediaThumbnailProps } from "@/components/MediaThumbnail";
import { formatMovieForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getSkyhookTV } from "@/lib/getSkyhookData";
import { getMovie } from "@/lib/getTmdbData";
import { prisma } from "@movies4discord/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface HistoryItem extends MediaThumbnailProps {
  tvdbId: number;
  isShow: boolean;
  season: number;
  episode: number;
  percentage: number;
}

export interface GetHistory {
  history: HistoryItem[];
}

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<GetHistory | { error: string } | { success: true }>
) => {
  const session = await getSession({ req: _req });
  if (!session) {
    res.status(401).json({ error: "get da fuc out of here" });
    return;
  }

  switch (_req.method) {
    case "GET": {
      const history = await prisma.history.findMany({
        where: {
          userId: session.userID,
          percentage: {
            gte: parseInt(_req.query.gte as string) || 5,
            lte: parseInt(_req.query.lte as string) || 95,
          },
        },
        orderBy: { updatedAt: "desc" },
        take: parseInt(_req.query.take as string) || undefined,
      });

      const historyData = await Promise.all(
        history.map(async (item) => {
          const media_type = item.isShow ? ("tv" as const) : ("movie" as const);
          if (media_type === "movie") {
            const movieDetails = await getMovie(item.tmdbId).catch(() => null);
            if (movieDetails === null) return null;
            const formattedMovie = await formatMovieForThumbnail(
              movieDetails,
              false
            );
            return {
              media_type,
              tvdbId: 0,
              isShow: false,
              season: 0,
              episode: 0,
              percentage: item.percentage,

              ...formattedMovie,
            } as HistoryItem;
          } else {
            const tvDetails = await getSkyhookTV(item.tvdbId).catch(() => null);
            if (tvDetails === null) return null;

            const episode = tvDetails.episodes.find(
              (e) =>
                e.seasonNumber === item.season &&
                e.episodeNumber === item.episode
            );
            if (episode === undefined) return null;
            return {
              media_type,
              tvdbId: item.tvdbId,
              isShow: true,
              season: item.season,
              episode: item.episode,
              percentage: item.percentage,

              id: item.tmdbId,
              title: `${tvDetails.title} - S${item.season}E${item.episode} - ${episode.title}`,
              image: {
                src: episode?.image ?? null,
                b64: null,
              },
              release_date: tvDetails.firstAired,
              rating: parseFloat(tvDetails.rating.value) || 0,
            } as HistoryItem;
          }
        })
      );

      const historyDataWithoutNull = historyData.filter(
        (item): item is HistoryItem => item !== null
      );
      res.status(200).json({ history: historyDataWithoutNull });
      return;
    }

    case "POST": {
      const media_type = _req.query.media_type;
      if (media_type !== "movie" && media_type !== "tv") {
        res.status(400).json({ error: "invalid media_type" });
        return;
      }

      const percentage = parseInt(_req.query.percentage as string);
      if (isNaN(percentage)) {
        res.status(400).json({ error: "invalid percentage" });
        return;
      }

      let dbParams: {
        isShow: boolean;
        tmdbId: number;
        tvdbId: number;
        season: number;
        episode: number;
        percentage: number;
      };
      if (media_type === "movie") {
        const tmdbId = parseInt(_req.query.tmdbId as string);
        if (isNaN(tmdbId)) {
          res.status(400).json({ error: "invalid tmdbId" });
          return;
        }
        dbParams = {
          isShow: false,
          tmdbId,
          tvdbId: 0,
          season: 0,
          episode: 0,
          percentage,
        };
      } else {
        const tvdbId = parseInt(_req.query.tvdbId as string);
        if (isNaN(tvdbId)) {
          res.status(400).json({ error: "invalid tvdbId" });
          return;
        }
        const season = parseInt(_req.query.season as string);
        if (isNaN(season)) {
          res.status(400).json({ error: "invalid season" });
          return;
        }
        const episode = parseInt(_req.query.episode as string);
        if (isNaN(episode)) {
          res.status(400).json({ error: "invalid episode" });
          return;
        }
        dbParams = {
          isShow: true,
          tmdbId: 0,
          tvdbId,
          season,
          episode,
          percentage,
        };
      }

      await prisma.history.upsert({
        where: {
          userId_tmdbId_tvdbId_isShow_season_episode: {
            userId: session.userID,
            isShow: dbParams.isShow,
            season: dbParams.season,
            episode: dbParams.episode,
            tmdbId: dbParams.tmdbId,
            tvdbId: dbParams.tvdbId,
          },
        },
        update: { percentage: dbParams.percentage },
        create: {
          userId: session.userID,
          ...dbParams,
        },
      });

      res.status(200).json({ success: true });
      return;
    }
  }
};

export default handler;
