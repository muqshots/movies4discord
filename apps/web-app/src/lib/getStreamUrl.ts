import { isProd } from "./isProd";

export const getStreamUrl = (server: string, viewKey: string) => {
  return isProd
    ? (process.env.NEXT_PUBLIC_STREAM_BASE
        ? process.env.NEXT_PUBLIC_STREAM_BASE
        : `https://${server.toLowerCase()}.movies4discord.xyz`) +
        `?viewkey=${viewKey}`
    : "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4";
};
