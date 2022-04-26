import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma, Server } from "@movies4discord/db";
import { servers } from "@/lib/getServers";

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | { error: string }>
) => {
  const session = await getSession({ req: _req });

  var check = null
  if (!session && !_req.query.id) {
    res.status(401).json({ error: "Unauthorized..." });
    return;
  }
  else if(_req.query.id){
    check = await prisma.user.findUnique({
      where:{
        id: _req.query.id as string
      }
    })
    if(!check){
      res.status(401).json({ error: "Unauthorized..." });
      return;
    }
  }

  const server = _req.query.server as Server | undefined;

  if (!server || !servers.includes(server)) {
    res.status(422).json({ error: "Invalid server" });
    return;
  }

  await prisma.user.update({
    where: { id: session ? session.userID : check?.id },
    data: { server },
  });

  res.status(200).json({ success: true });
  return;
};

export default handler;
