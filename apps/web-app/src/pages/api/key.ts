import { checkEpisode, checkMovie } from "@/lib/getArrData";
import { sonarr } from "@/lib/got";
import { prisma } from "@movies4discord/db";
import { SonarrEpisodeFile } from "@movies4discord/interfaces";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  switch (_req.method) {
    case "GET": {
      const viewkey = _req.query.viewkey as string | undefined;

      if (!viewkey) {
        res.status(422).json({ error: "No viewkey given" });
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
        if (!vk.season || !vk.episode || !vk.tmvdbId) {
          res.status(422).json({ error: "Mislabeled key" });
          return;
        }

        const sonarrEpisode = await checkEpisode(vk.tmvdbId, vk.season, vk.episode);
        if (!sonarrEpisode?.exists) {
          res.status(404).json({ error: "Episode not available" });
          return;
        }

        const sonarrEpisodeFile = await sonarr
          .get(`episodefile/${sonarrEpisode!.episodeFileId}`)
          .json<SonarrEpisodeFile>();

        res.status(200).json({
          name: `${sonarrEpisode.seriesTitle} (S${vk.season}E${vk.episode})`,
          path: sonarrEpisodeFile.path,
          err: false,
        });
        return;
      } else {
        const movie = await checkMovie(vk.tmvdbId);
        if (!movie.exists) {
          res.status(404).json({ error: "Movie not available" });
          return;
        }

        res.status(200).json({
          name: `${movie.title} (${movie.year})`,
          path: movie.path,
          err: false,
        });
        return;
      }
    }

    case "POST": {
      const session = await getServerSession(_req, res, authOptions);
      const user = await prisma.user.findUnique({
        where: { id: session?.userID || _req.query.id as string }
      });

      if (!user) {
        res.status(401).json({ error: "Unauthorized..." });
        return;
      }

      const server = user.server.toLowerCase() ?? "eu";
      const media_type = _req.query.media_type as string | undefined;

      if (media_type !== "movie" && media_type !== "tv") {
        res.status(420).json({ error: "Invalid media type" });
        return;
      }

      let dbParams: {
        tmvdbId: number;
        season: number;
        episode: number;
        isShow: boolean;
      };

      if (media_type === "movie") {
        const tmdbId = parseInt(_req.query.tmdbId as string);
        if (Number.isNaN(tmdbId)) {
          res.status(421).json({ error: "No tmdbId given" });
          return;
        }
        dbParams = { tmvdbId: tmdbId, season: 0, episode: 0, isShow: false };
      } else {
        const tvdbId = parseInt(_req.query.tvdbId as string);
        if (Number.isNaN(tvdbId)) {
          res.status(421).json({ error: "No tvdbId given" });
          return;
        }

        const season = parseInt(_req.query.season as string);
        const episode = parseInt(_req.query.episode as string);
        if (Number.isNaN(season) || Number.isNaN(episode)) {
          res.status(422).json({ error: "No season/episode given" });
          return;
        }

        dbParams = { tmvdbId: tvdbId, season, episode, isShow: true };
      }

      const exists = await prisma.viewkey.findUnique({
        where: {
          userId_tmvdbId_isShow_season_episode: {
            userId: user.id,
            ...dbParams,
          },
        },
        select: { key: true, createdAt: true },
      });

      if (exists) {
        if (
          new Date().getTime() - exists.createdAt.getTime() < 1000 * 60 * 60 * 4
        ) {
          res.status(200).json({ key: exists.key, server });
          return;
        } else {
          await prisma.viewkey.delete({
            where: { key: exists.key },
            select: { key: true },
          });
        }
      }

      if (media_type === "movie") {
        const movie = await checkMovie(dbParams.tmvdbId);
        if (!movie.exists) {
          res.status(404).json({ error: "Movie not available" });
          return;
        }
      } else {
        const episode = await checkEpisode(
          dbParams.tmvdbId,
          dbParams.season,
          dbParams.episode
        );
        if (!episode.exists) {
          res.status(404).json({ error: "Episode not available" });
          return;
        }
      }

      const { key } = await prisma.viewkey.create({
        data: { userId: user.id, ...dbParams },
        select: { key: true },
      });

      res.status(200).json({ key, server });
      return;
    }
  }
};
export default handler;
