import { MediaThumbnailProps } from "@/components/MediaThumbnail";
import { formatMovieForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getSkyhookTV } from "@/lib/getSkyhookData";
import { getMovie } from "@/lib/getTmdbData";
import { prisma } from "@movies4discord/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

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
  res: NextApiResponse<
    | GetHistory
    | { error: string }
    | { success: true }
    | { percentage: number | null }
  >
) => {
  const session = await getServerSession(_req, res, authOptions);
  let check = null
  if (!session && !_req.query.id) {
    res.status(401).json({ error: "Unauthorized..." });
    return;
  }
  else if (_req.query.id) {
    check = await prisma.user.findUnique({
      where:{
        id: _req.query.id as string
      }
    })
    if(!check){
      res.status(401).json({ error: "Unauthorized..." });
      return;
    }
  }

  switch (_req.method) {
    case "GET": {
      if (_req.query.one) {
        const historyOne = await prisma.history.findUnique({
          where: {
            userId_tmdbId_tvdbId_isShow_season_episode: {
              userId: session ? session.userID : check!.id,
              tmdbId: parseInt(_req.query.tmdbId as string) || 0,
              tvdbId: parseInt(_req.query.tvdbId as string) || 0,
              isShow: _req.query.media_type === "tv",
              season: parseInt(_req.query.season as string) || 0,
              episode: parseInt(_req.query.episode as string) || 0,
            },
          },
        });

        res.status(200).json({ percentage: historyOne?.percentage ?? null });
        return;
      }

      const history = await prisma.history.findMany({
        where: {
          userId: session ? session.userID : check!.id,
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
              isShow: false,
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
              rating: tvDetails.rating?.value
                ? parseFloat(tvDetails.rating?.value)
                : 0,
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
        const tmdbId = parseInt(_req.query.tmdbId as string);
        if (isNaN(tmdbId)) {
          res.status(400).json({ error: "invalid tmdbId" });
          return;
        }
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
          tmdbId,
          tvdbId,
          season,
          episode,
          percentage,
        };
      }

      await prisma.history.upsert({
        where: {
          userId_tmdbId_tvdbId_isShow_season_episode: {
            userId: session ? session.userID : check!.id,
            isShow: dbParams.isShow,
            season: dbParams.season,
            episode: dbParams.episode,
            tmdbId: dbParams.tmdbId,
            tvdbId: dbParams.tvdbId,
          },
        },
        update: { percentage: dbParams.percentage },
        create: {
          userId: session ? session.userID : check!.id,
          ...dbParams,
        },
      });

      res.status(200).json({ success: true });
      return;
    }

    case "DELETE": {
      // hans get ze flammenwerfer
      await prisma.history.delete({
        where: {
          userId_tmdbId_tvdbId_isShow_season_episode: {
            userId: session ? session.userID : check!.id,
            tmdbId: parseInt(_req.query.tmdbId as string) || 0,
            tvdbId: parseInt(_req.query.tvdbId as string) || 0,
            isShow: _req.query.media_type === "tv",
            season: parseInt(_req.query.season as string) || 0,
            episode: parseInt(_req.query.episode as string) || 0,
          },
        },
      }).catch((err) => {

        res.status(500).json({ error: "error deleting history item" });
        return;
      });

      res.status(200).json({ success: true });
      return;
    }
  }
};

export default handler;
