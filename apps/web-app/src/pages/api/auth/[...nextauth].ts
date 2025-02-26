import { prisma } from "@movies4discord/db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import got from "got";
import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
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
    async signIn({ user, account, profile }) {
      if (user.image !== profile?.image_url) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: profile?.image_url as string },
        });
      }

      const list_of_guilds = await got
        .get("https://discord.com/api/users/@me/guilds", {
          headers: { Authorization: `Bearer ${account?.access_token}` },
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

      const allowedToSignIn = list_of_guilds.some(
        (g) => g.id === "935915138429648997"
      );

      return allowedToSignIn || "https://discord.movies4discord.xyz";
    },
    async session({ session, user }) {
      session.userID = user.id;
      session.admin = user.admin;
      return session;
    },
  },
}

export default NextAuth(authOptions);
