import { withPlaiceholder } from "@plaiceholder/next";

const config = withPlaiceholder({
  experimental: { externalDir: true },
  reactStrictMode: false,
  images: {
    imageSizes: [16, 32, 48, 64], // This array is concatenated to deviceSizes.
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Next.js default
    deviceSizes: [
      96, 128, 212, 240, 256, 292, 320, 384, 424, 480, 512, 584, 640, 750, 828,
      1080, 1200, 1920, 2048, 3840,
    ],
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // default

    domains: ["cdn.discordapp.com", "image.tmdb.org", "artworks.thetvdb.com"],
  },
});

export default config;
