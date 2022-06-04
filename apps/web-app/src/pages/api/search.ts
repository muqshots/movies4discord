import { MediaThumbnailProps } from "@/components/MediaThumbnail";
import { getImageUrl } from "@/lib/getImageUrl";
import { getQuery } from "@/lib/getQuery";
import { getMultiSearch } from "@/lib/getTmdbData";
import type {
  MovieWithMediaType,
  TVWithMediaType,
} from "@movies4discord/interfaces";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<{ results: MediaThumbnailProps[] }>
) => {
  let { query } = _req.query;
  query = getQuery(query);

  if (!query) {
    return;
  }

  const resultsW = await getMultiSearch(query);
  const isMedia = (
    media: typeof resultsW[0]
  ): media is MovieWithMediaType | TVWithMediaType =>
    media.media_type === "movie" || media.media_type === "tv";

  const results = resultsW.filter(isMedia).map((r) => ({
    media_type: r.media_type,
    id: r.id,
    episode: 0,
    season: 0,
    tvdbId: 0,
    title: r.media_type === "movie" ? r.title : r.name,
    image: { src: getImageUrl(r.backdrop_path), b64: null },
    release_date:
      (r.media_type === "movie" ? r.release_date : r.first_air_date) || null,
    rating: r.vote_average,
  }));

  res.status(200).json({ results });
};

export default handler;
