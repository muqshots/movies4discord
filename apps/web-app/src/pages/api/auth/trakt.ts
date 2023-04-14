import { prisma } from "@movies4discord/db";
import { trakt } from "@/lib/got";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface TraktTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

interface TraktUserSettings {
  user: {
    username: string;
    private: boolean;
  }
}
const CLIENT_ID = process.env.TRAKT_ID;
const CLIENT_SECRET =  process.env.TRAKT_SECRET;

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession({ req: _req });

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

  const userId = check ? check?.id : session?.userID || "";

  const traktAcc = await prisma.account.findFirst({
    where: {
      userId: userId,
      provider: "trakt",
    },
  });

  if (_req.method === "GET" && !_req.query.code) {
    res.redirect(
      `https://trakt.tv/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${process.env.NEXTAUTH_URL + "/api/auth/trakt"}`
    );
  }

  if (_req.method === "GET" && _req.query.code) {
    const response = await trakt.post("oauth/token", {
      json: {
        code: _req.query.code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/trakt",
        grant_type: "authorization_code"
      }
    }).json<TraktTokenResponse>();

    if (!response.access_token) {
      res.status(401).json({ error: "Unauthorized..." });
      return;
    }

    const traktProfile = await trakt.get("users/settings", {
      headers: {
        Authorization: `Bearer ${response.access_token}`,
      },
    }).json<TraktUserSettings>();

    if (!traktAcc) {
      const traktAcc = await prisma.account.create({
        data: {
          type: "oauth",
          provider: "trakt",
          providerAccountId: traktProfile.user.username,
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: response.created_at + response.expires_in,
          token_type: response.token_type,
          scope: response.scope,
          created_at: response.created_at,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } else {
      const traktAcc= await prisma.account.updateMany({
        where: {
          user: {
            id: userId,
          },
          provider: "trakt",
        },
        data: {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: response.created_at + response.expires_in,
        },
      });
    }

    res.redirect(process.env.NEXTAUTH_URL! + "/settings");
  }

  // use this to get the access token
  // if (_req.method === "POST") {
  // }
};

export default handler;