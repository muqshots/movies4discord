import { prisma } from "@movies4discord/db";
import { NextApiRequest, NextApiResponse } from "next";

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
      };
      if (!vk.isShow) {
        res.status(422).json({ error: "Movie not suppported" });
        return;
      }
      if (!vk.season || !vk.episode || !vk.tmvdbId) {
        res.status(422).json({ error: "Mislabeled key" });
        return;
      };

      const timestamps = await prisma.introTimestamp.findFirst({
        where: {
          tvdbId: vk.tmvdbId,
          season: vk.season,
          episode: vk.episode,
        },
      });

      if (!timestamps) {
        res.status(404).json({ error: "Timestamps not available currently" });
        return;
      };

      res.status(200).json({
        start: timestamps.startTimestamp,
        end: timestamps.endTimestamp
      });
      return;
    }
  }
};
export default handler;
