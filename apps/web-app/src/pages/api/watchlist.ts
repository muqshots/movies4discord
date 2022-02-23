import {
  formatMovieForThumbnail,
  formatTVForThumbnail,
} from "@/lib/formatMediaForThumbnail";
import { getMovie, getTV } from "@/lib/getTmdbData";
import { prisma } from "@movies4discord/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const jwt = await getToken({
    req: _req,
    secret: process.env.AUTH_SECRET!,
  });

  if (!jwt) {
    res.status(401).json({ error: "Unauthorized..." });
    return;
  }

  const tmdbId = parseInt(_req.query.tmdbId as string) as number;

  const isShowString = _req.query.isShow;
  const isShow = isShowString === "true";

  switch (_req.method) {
    case "GET": {
      if (Number.isNaN(tmdbId)) {
        const watchlist = await prisma.watchlist.findMany({
          select: { tmdbId: true, isShow: true },
          where: { userId: jwt.userID },
          orderBy: { createdAt: "desc" },
        });

        const watchlistData = await Promise.all(
          watchlist.map(async (item) => {
            const media_type = item.isShow
              ? ("tv" as const)
              : ("movie" as const);
            try {
              if (media_type === "movie") {
                const movieDetails = await getMovie(item.tmdbId);
                const formattedMovie = await formatMovieForThumbnail(
                  movieDetails,
                  false
                );
                return { media_type: "movie", ...formattedMovie };
              } else {
                const tvDetails = await getTV(item.tmdbId);
                const formattedTV = await formatTVForThumbnail(
                  tvDetails,
                  false
                );
                return { media_type: "tv", ...formattedTV };
              }
            } catch (e) {
              return null;
            }
          })
        );
        res.status(200).json(watchlistData.filter((i) => i !== null));
      } else {
        const isInWatchlist = !!(await prisma.watchlist.findUnique({
          select: { id: true },
          where: {
            userId_tmdbId_isShow: {
              userId: jwt.userID,
              tmdbId: tmdbId,
              isShow: isShow,
            },
          },
        }));
        res.status(200).json({ isInWatchlist });
      }
      break;
    }
    case "POST": {
      const createdItem = await prisma.watchlist.create({
        data: { tmdbId, isShow, userId: jwt.userID },
      });
      res.status(200).json(createdItem);
      break;
    }
    case "DELETE": {
      await prisma.watchlist.delete({
        where: { userId_tmdbId_isShow: { userId: jwt.userID, tmdbId, isShow } },
      });
      res.status(200).json({});
      break;
    }
  }
};

export default handler;
