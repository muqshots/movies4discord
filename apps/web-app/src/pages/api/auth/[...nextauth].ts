import { prisma } from "@movies4discord/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import got from "got";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export default NextAuth({
  secret: process.env.AUTH_SECRET!,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify guilds",
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async signIn({ account }) {
      const list_of_guilds = await got
        .get("https://discord.com/api/users/@me/guilds", {
          headers: { Authorization: `Bearer ${account.access_token}` },
        })
        .json<
          {
            id: string;
            name: string;
            icon: string;
            owner: boolean;
            permissions: number;
            features: string[];
            permissions_new: string;
          }[]
        >();

      // TODO: Change this to new server
      // const allowedToSignIn = list_of_guilds.some((guild) => {
      // return guild.id === "746993915361624074";
      // });

      return true;
    },
    async session({ session, user }) {
      session.userID = user.id;
      return session;
    },
  },
});
