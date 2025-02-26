import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@movies4discord/db";
import { authOptions } from "./auth/[...nextauth]";

const handler = async (
    _req: NextApiRequest,
    res: NextApiResponse
) => {
    const session = await getServerSession(_req, res, authOptions);
    let check = null
    if (!session && !_req.query.id) {
        res.status(401).json({ error: "Unauthorized..." });
        return;
    }
    else if (_req.query.id) {
        check = await prisma.user.findUnique({
            where: {
                id: _req.query.id as string
            }
        })
        if (!check) {
            res.status(401).json({ error: "Unauthorized..." });
            return;
        }
    }
    switch (_req.method) {
        case "DELETE": {
            const acc = await prisma.user.deleteMany({
                where: {
                    accounts: {
                        some: {
                            providerAccountId: _req.query.userId as string
                        }    
                    }
                }
            })
            if (acc.count >= 1) {
                res.status(200).json({ success: "User account found and all related data was deleted." })
                return;
            }
            res.status(404).json({ error: "User account was not found." })
            return;
        }
        case "GET":{
            const acc = await prisma.user.findFirst({
                where: {
                    accounts: {
                        some: {
                            providerAccountId: _req.query.userId as string
                        }    
                    }
                }
            })

            if(acc){
                res.status(200).json({ success: "User account found. Login allowed." })
                return;
            }
            res.status(404).json({ error: "User account was not found." })
            return;
        }
        default: {
            res.status(405).json({ error: "Method not allowed" })
            return;
        }
    }
    }

    export default handler;