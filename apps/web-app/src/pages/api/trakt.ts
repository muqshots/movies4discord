import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@movies4discord/db";
import { trakt } from "@/lib/got";
import { TokenResponse } from "@movies4discord/interfaces";
import { authOptions } from "./auth/[...nextauth]";

const CLIENT_ID = process.env.TRAKT_ID;
const CLIENT_SECRET =  process.env.TRAKT_SECRET;

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerSession(_req, res, authOptions);

  let check = null;
  if (!session && !_req.query.id) {
    res.status(401).json({ error: "Unauthorized..." });
    return;
  } else if (_req.query.id) {
    check = await prisma.user.findUnique({
      where: {
        id: _req.query.id as string,
      },
    });
    if (!check) {
      res.status(401).json({ error: "Unauthorized..." });
      return;
    }
  }

  const traktAcc = await prisma.account.findFirst({
    where: {
      userId: check ? check?.id : session?.userID,
      provider: "trakt",
    },
  });
  if (!traktAcc) {
    res.status(401).json({ error: "No trakt account linked" });
    return;
  }

  let token = traktAcc.access_token;

  if (traktAcc.expires_at && traktAcc.expires_at < (Date.now() / 1000)) {
    const refresh_token = await trakt
      .post("oauth/token", {
        json: {
          refresh_token: traktAcc.refresh_token,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/trakt",
          grant_type: "refresh_token"
        },
      }).json<TokenResponse>();

    if (!refresh_token.access_token) {
      res.status(401).json({ error: "Failed to refresh trakt token" });
      return;
    }

    await prisma.account.update({
      where: {
        id: traktAcc.id,
      },
      data: {
        access_token: refresh_token.access_token,
        refresh_token: refresh_token.refresh_token,
        expires_at: refresh_token.created_at + refresh_token.expires_in,
      },
    });

    token = refresh_token.access_token;
  }

  switch (_req.method) {
    case "GET":
      if (_req.query.mode === "search") {
        const tmdbId = parseInt(_req.query.tmdbId as string);
        if (Number.isNaN(tmdbId)) {
          res.status(422).json({ error: "No tmdbId provided" });
          return;
        }
        const showData = await trakt
          .get(`search/tmdb/${tmdbId}`, { searchParams: { type: "show" } })
          .json();
        res.status(200).json(showData);
      } else if (_req.query.mode === "episode") {
        const showId = parseInt(_req.query.showId as string);
        const seasonNumber = parseInt(_req.query.season as string);
        const episodeNumber = parseInt(_req.query.episode as string);
        if (
          Number.isNaN(showId) ||
          Number.isNaN(seasonNumber) ||
          Number.isNaN(episodeNumber)
        ) {
          res.status(422).json({ error: "No episode info provided" });
          return;
        }
        const showData = await trakt
          .get(`shows/${showId}/seasons/${seasonNumber}/episodes/${episodeNumber}`)
          .json();
        res.status(200).json(showData);
      }
      break;
    case "POST":
      if (_req.body.mode === "scrobble/start") {
        const mediaType = _req.body.mediaType;
        const tmdbId = parseInt(_req.body.tmdbId);
        const episodeId = parseInt(_req.body.episodeId as string);
        const progress = parseInt(_req.body.progress as string);

        if (Number.isNaN(progress)) {
          res.json({ error: "No progress" });
          return;
        }
        if (
          (mediaType === "tv" && Number.isNaN(episodeId)) ||
          (mediaType === "movie" && Number.isNaN(tmdbId))
        ) {
          res.status(422).json({ error: "Jesse, we need ids" });
          return;
        }
        if (mediaType === "tv") {
          await trakt.post(`scrobble/start`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            json: {
              episode: {
                ids: {
                  trakt: episodeId,
                },
              },
              progress: progress,
              app_version: "1.0",
              app_date: "2023-03-06",
            },
          });
        } else {
          await trakt
            .post(`scrobble/start`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              json: {
                movie: {
                  ids: {
                    tmdb: tmdbId,
                  },
                },
                progress: progress,
                app_version: "1.0",
                app_date: "2023-03-06",
              },
            })
            .json()
        }
        res.status(200).json({ message: "scrobble started" });
      } else if (_req.body.mode === "scrobble/pause") {
        const mediaType = _req.body.mediaType;
        const tmdbId = parseInt(_req.body.tmdbId as string);
        const episodeId = parseInt(_req.body.episodeId as string);
        const progress = parseInt(_req.body.progress as string);

        if (Number.isNaN(progress)) {
          res.json({ error: 'No progress' });
          return;
        }
        if (
          (mediaType === "tv" && Number.isNaN(episodeId)) ||
          (mediaType === "movie" && Number.isNaN(tmdbId))
        ) {
          res.status(422).json({ error: "Jesse, we need ids" });
          return;
        }
        if (mediaType === "tv") {
          trakt.post(`scrobble/pause`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            json: {
              episode: {
                ids: {
                  trakt: episodeId,
                },
              },
              progress: progress,
              app_version: "1.0",
              app_date: "2023-03-06",
            },
          });
        } else {
          trakt.post(`scrobble/pause`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            json: {
              movie: {
                ids: {
                  tmdb: tmdbId,
                },
              },
              progress: progress,
              app_version: "1.0",
              app_date: "2023-03-06",
            },
          });
        }
        res.status(200).json({ message: "scrobble paused" });
      } else if (_req.body.mode === "scrobble/stop") {
        const mediaType = _req.body.mediaType;
        const tmdbId = parseInt(_req.body.tmdbId);
        const episodeId = parseInt(_req.body.episodeId as string);
        const progress = parseInt(_req.body.progress as string);
        if (Number.isNaN(progress)) {
          res.json({ error: 'No progress' });
          return;
        }
        if (
          (mediaType === "tv" && Number.isNaN(episodeId)) ||
          (mediaType === "movie" && Number.isNaN(tmdbId))
        ) {
          res.status(422).json({ error: "Jesse, we need ids" });
          return;
        }

        if (progress < 90) {
          res
            .status(422)
            .json({ error: "Progress has not reached threshold." });
          return;
        }

        if (mediaType === "tv") {
          trakt.post(`scrobble/stop`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            json: {
              episode: {
                ids: {
                  trakt: episodeId,
                },
              },
              progress: progress,
              app_version: "1.0",
              app_date: "2023-03-06",
            },
          });
        } else {
          trakt.post(`scrobble/stop`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            json: {
              movie: {
                ids: {
                  tmdb: tmdbId,
                },
              },
              progress: progress,
              app_version: "1.0",
              app_date: "2023-03-06",
            },
          });
        }
        res.status(200).json({ message: "scrobble stopped" });
      }
      break;
  }
};

export default handler;
