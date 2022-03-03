import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma, Server } from "@movies4discord/db";
import { servers } from "@/lib/getServers";

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | { error: string }>
) => {
  const session = await getSession({ req: _req });

  if (!session) {
    res.status(401).json({ error: "Unauthorized..." });
    return;
  }

  const server = _req.query.server as Server | undefined;

  if (!server || !servers.includes(server)) {
    res.status(422).json({ error: "Invalid server" });
    return;
  }

  await prisma.user.update({
    where: { id: session.userID },
    data: { server },
  });

  res.status(200).json({ success: true });
  return;
};

export default handler;
