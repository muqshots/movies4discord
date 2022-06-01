import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@movies4discord/db";

const handler = async (
    _req: NextApiRequest,
    res: NextApiResponse
) => {
    const session = await getSession({ req: _req });
    if (!session && _req.method !== "POST") {
        res.status(401).json({ error: "Unauthorized..." });
        return;
    }
    switch (_req.method) {
        case "GET": {
            const pincode = await prisma.pincode.findFirst({
                where: {
                    userId: session?.userID
                }
            })

            if (pincode) {
                if (new Date().getTime() - pincode.createdAt.getTime() < 1000 * 60 * 5) {
                    res.status(200).json({ pincode: pincode.pincode })
                    return;
                }
                const deletion = await prisma.pincode.deleteMany({
                    where: {
                        pincode: pincode.pincode
                    }
                })
            }

            const chars = '0123456789';

            // Pick numbers randomly
            let str = '';
            for (let i = 0; i < 6; i++) {
                str += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const newpincode = await prisma.pincode.create({
                data: {
                    userId: session?.userID as string,
                    pincode: parseInt(str)
                },
                select: {
                    pincode: true
                }
            })

            res.status(200).json(newpincode)
            return;

        }
        case "POST": {
            const pincode = await prisma.pincode.findFirst({
                where: {
                    pincode: parseInt(_req.query.pincode as string)
                }
            })

            if (pincode) {
                if (new Date().getTime() - pincode.createdAt.getTime() > 5 * 1000) {
                    res.status(200).json({ user_id: pincode.userId })
                    return;
                }
                const deletion = await prisma.pincode.deleteMany({
                    where: {
                        pincode: parseInt(_req.query.pincode as string)
                    }
                })
            }
            res.status(404).json({ error: "Invalid pincode provided." })
            return;
        }
    }
}

export default handler;