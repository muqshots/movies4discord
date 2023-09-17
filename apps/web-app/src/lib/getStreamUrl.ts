import { isProd } from "./isProd";

const placeHolderVideo =
  "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4";
const STREAM_BASE = process.env.NEXT_PUBLIC_STREAM_BASE;

export const getStreamUrl = (server: string, viewKey: string) => {
  return STREAM_BASE
    ? STREAM_BASE === "false"
      ? placeHolderVideo
      : `${STREAM_BASE}?viewkey=${viewKey}`
    : isProd
      ? `https://${server.toLowerCase()}.movies4discord.xyz?viewkey=${viewKey}`
      : placeHolderVideo;
};
