import { radarr } from "@/lib/got";
import { RadarrMovie } from "@movies4discord/interfaces";
import { NextApiRequest, NextApiResponse } from "next";

export interface CheckMovieAvailability {
  available: boolean;
}

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<CheckMovieAvailability | { error: string }>
) => {
  const tmdbId = parseInt(_req.query.tmdbId as string);

  if (Number.isNaN(tmdbId)) {
    res.status(422).json({ error: "Invalid tmdbId" });
    return;
  }

  const data = await radarr
    .get("movie", { searchParams: { tmdbId } })
    .json<RadarrMovie[]>();

  res.status(200).json({
    available: data[0]?.hasFile ?? false,
  });
};
export default handler;
