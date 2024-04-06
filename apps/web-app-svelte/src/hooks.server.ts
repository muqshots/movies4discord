import { SvelteKitAuth } from "@auth/sveltekit"
import Discord from "@auth/sveltekit/providers/discord"
import { PrismaAdapter } from "@auth/prisma-adapter"
import got from "got";
import { prisma } from "@movies4discord/db";

// Extending user and session interfaces.
declare module "@auth/sveltekit" {
    interface Session {
        admin: boolean
    }
    interface User {
        admin: boolean
    }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [
        Discord({
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
            session.userId = user.id;
            session.admin = user.admin;
            return session;
        },
    },
})
