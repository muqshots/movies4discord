import ContinueWatching from "@/components/ContinueWatching";
import RecommendationsSlider from "@/components/RecommendationsSlider";
import {
  formatMovieForThumbnail,
  formatTVForThumbnail,
} from "@/lib/formatMediaForThumbnail";
import { discoverTV, getAvailablePopularMovies } from "@/lib/getTmdbData";
import { isProd } from "@/lib/isProd";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

const Index = ({ sliders }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="mx-3 flex flex-col gap-8">
      {sliders.map((slider, i) => (
        <div className="relative mr-2 flex flex-col gap-4" key={i}>
          <span className="text-2xl font-light md:text-3xl">{slider.text}</span>
          <hr />
          <RecommendationsSlider recommendations={slider.media} {...slider} />
        </div>
      ))}

      <ContinueWatching />
    </div>
  );
};

export default Index;

// Should be static props but docker can't access db on build
export const getServerSideProps = async ({ res }: GetServerSidePropsContext) => {
  const doPlaceholders = isProd;
  const sliders = [];

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=59'
  )

  sliders.push({
    text: "Popular movies",
    media_type: "movie" as const,
    media: await Promise.all(
      (await getAvailablePopularMovies())
        .slice(0, 15)
        .map(async (movie) => formatMovieForThumbnail(movie, doPlaceholders, true))
    ),
  });

  sliders.push({
    text: "Popular TV",
    media_type: "tv" as const,
    media: await Promise.all(
      (await discoverTV())
        .slice(0, 15)
        .map(async (tv) => formatTVForThumbnail(tv, doPlaceholders, true))
    ),
  });

  return {
    props: {
      sliders,
    },
    // revalidate: 129600, // Revalidate every 36 hours
  };
};
