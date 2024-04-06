import {
  formatMovieForThumbnail,
  formatTVForThumbnail,
} from "@/lib/formatMediaForThumbnail";
import { getMovie, getTV } from "@/lib/getTmdbData";
import { prisma } from "@movies4discord/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(_req, res, authOptions);

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

  const tmdbId = parseInt(_req.query.tmdbId as string) as number;

  const isShowString = _req.query.isShow;
  const isShow = isShowString === "true";

  switch (_req.method) {
    case "GET": {
      if (Number.isNaN(tmdbId)) {
        const watchlist = await prisma.watchlist.findMany({
          select: { tmdbId: true, isShow: true },
          where: { userId: session ? session.userID : check?.id },
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
              userId: session ? session.userID : check?.id as string,
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
        data: { tmdbId, isShow, userId: session ? session.userID : check?.id as string },
      });
      res.status(200).json(createdItem);
      break;
    }
    case "DELETE": {
      await prisma.watchlist.delete({
        where: {
          userId_tmdbId_isShow: { userId: session ? session.userID : check?.id as string, tmdbId, isShow },
        },
      });
      res.status(200).json({});
      break;
    }
  }
};

export default handler;
