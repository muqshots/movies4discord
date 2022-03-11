import { radarr, radarrLru, radarrPrefix } from "@/lib/got";
import { RadarrMovie } from "@movies4discord/interfaces";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { json } from "stream/consumers";

export type CheckMovieAvailability = {
  id: number | null;
  available: boolean;
  movieFileId: number | null;
};

export interface MovieAction {
  success: boolean;
}

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<CheckMovieAvailability | { error: string } | MovieAction>
) => {
  const session = await getSession({ req: _req });
  if (!session) {
    res.status(401).json({ error: "Unauthorized..." });
    return;
  }

  switch (_req.method) {
    case "GET": {
      const tmdbId = parseInt(_req.query.tmdbId as string);

      if (Number.isNaN(tmdbId)) {
        res.status(422).json({ error: "Invalid tmdbId" });
        return;
      }

      const data = await radarr
        .get("movie", { searchParams: { tmdbId } })
        .json<RadarrMovie[]>();

      res.status(200).json({
        id: data[0]?.id ?? null,
        available: data[0]?.hasFile ?? false,
        movieFileId: data[0]?.movieFile?.id ?? null,
      });
      return;
    }

    case "POST": {
      if (!session.admin) {
        res.status(401).json({ error: "Unauthorized..." });
        return;
      }

      const action = _req.query.action as string;
      if (action !== "replace" && action !== "search") {
        res.status(422).json({ error: "oi wut" });
        return;
      }

      const tmdbId = parseInt(_req.query.tmdbId as string);
      if (Number.isNaN(tmdbId)) {
        res.status(422).json({ error: "Invalid tmdbId" });
        return;
      }

      if (action === "search") {
        const movie = (
          await radarr
            .get(`movie/lookup`, {
              searchParams: { term: `tmdb:${tmdbId}` },
            })
            .json<RadarrMovie[]>()
        )[0];

        if (!movie) {
          res.status(422).json({ error: "No movie found" });
          return;
        }

        if (movie?.id) {
          radarr.post(`command`, {
            json: { name: "MoviesSearch", movieIds: [movie.id] },
          });
        } else {
          const { title, year, images, titleSlug } = movie;
          radarr.post(`movie`, {
            json: {
              title,
              year,
              tmdbId,
              images,
              titleSlug,
              monitored: true,
              addOptions: { searchForMovie: true },
              rootFolderPath: process.env.RADARR_ROOT_FOLDER,
              qualityProfileId: parseInt(
                process.env.RADARR_QUALITY_PROFILE as string
              ),
            },
          });
        }

        res.status(200).json({ success: true });
      }

      if (action === "replace") {
        const id = parseInt(_req.query.id as string);
        if (Number.isNaN(id)) {
          res.status(422).json({ error: "Invalid id" });
          return;
        }

        const movieFileId = parseInt(_req.query.movieFileId as string);
        if (Number.isNaN(movieFileId)) {
          res.status(422).json({ error: "Invalid movieFileId" });
          return;
        }

        radarr.delete(`moviefile/${movieFileId}`).json();

        await new Promise<void>((resolve) => {
          setTimeout(() => {
            radarr.post(`command`, {
              json: { name: "MoviesSearch", movieIds: [id] },
            });
            resolve();
          }, 4000);
        });

        res.status(200).json({ success: true });
      }

      radarrLru.delete(
        `${radarrPrefix}/movie?apikey=${process.env.RADARR_API_KEY}&tmdbId=${tmdbId}`
      );
      return;
    }
  }
};
export default handler;
