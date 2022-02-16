import { NextApiRequest, NextApiResponse } from "next";
import { RadarrMovie } from "@movies4discord/interfaces";
import { prisma } from "@movies4discord/db";
import { radarr } from "@/lib/got";
import { getToken } from "next-auth/jwt";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  switch (_req.method) {
    case "GET": {
      const viewkey = _req.query.viewkey as string | undefined;

      if (!viewkey) {
        res.status(422).json({ error: "No vk given" });
        return;
      }

      const vk = await prisma.viewkey.findUnique({ where: { key: viewkey } });

      if (!vk) {
        res.status(422).json({ error: "Invalid key" });
        return;
      }
      if (new Date().getTime() - vk.createdAt.getTime() > 1000 * 60 * 60 * 4) {
        res.status(422).json({ error: "Expired key" });
        return;
      }

      if (vk.isShow) {
        res.status(404).json({ error: "bruhw" });
        return;
      } else {
        const radarrData = await radarr
          .get("movie", { searchParams: { tmdbId: vk.tmvdbId } })
          .json<RadarrMovie[]>();
        const movieAvailable = radarrData[0]?.hasFile ?? false;
        if (!movieAvailable) {
          res.status(404).json({ error: "Movie not available" });
          return;
        }

        res.status(200).json({
          name: `${radarrData[0]!.title} (${radarrData[0]!.year})`,
          path: radarrData[0]!.movieFile!.path,
          err: false,
        });
        return;
      }
    }

    case "POST": {
      const jwt = await getToken({
        req: _req,
        secret: process.env.AUTH_SECRET!,
      });
      if (!jwt) {
        res.status(401).json({ error: "get da fuc out of here" });
        return;
      }

      const media_type = _req.query.media_type as string | undefined;

      if (media_type !== "movie" && media_type !== "tv") {
        res.status(422).json({ error: "Invalid media type" });
        return;
      }

      if (media_type === "movie") {
        const tmdbId = parseInt(_req.query.tmdbId as string);
        if (Number.isNaN(tmdbId)) {
          res.status(422).json({ error: "No tmdbId given" });
          return;
        }

        const key = await prisma.viewkey.upsert({
          where: {
            userId_tmvdbId_isShow_season_episode: {
              userId: jwt.userID,
              tmvdbId: tmdbId,
              isShow: false,
              season: 0,
              episode: 0,
            },
          },
          update: {
            createdAt: new Date(),
          },
          create: {
            userId: jwt.userID,
            tmvdbId: tmdbId,
            isShow: false,
            season: 0,
            episode: 0,
          },
          select: { key: true },
        });

        res.status(200).json(key);
        return;
      } else {
        const tvdbId = parseInt(_req.query.tvdbId as string);
        if (Number.isNaN(tvdbId)) {
          res.status(422).json({ error: "No tvdbId given" });
          return;
        }

        const season = parseInt(_req.query.season as string);
        const episode = parseInt(_req.query.episode as string);
        if (Number.isNaN(season) || Number.isNaN(episode)) {
          res.status(422).json({ error: "No season/episode given" });
          return;
        }

        const key = await prisma.viewkey.upsert({
          where: {
            userId_tmvdbId_isShow_season_episode: {
              userId: jwt.userID,
              tmvdbId: tvdbId,
              isShow: true,
              season: season,
              episode: episode,
            },
          },
          update: {
            createdAt: new Date(),
          },
          create: {
            userId: jwt.userID,
            tmvdbId: tvdbId,
            isShow: true,
            season: season,
            episode: episode,
          },
          select: { key: true },
        });

        res.status(200).json(key);
        return;
      }
    }
  }
};
export default handler;
