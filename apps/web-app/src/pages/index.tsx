import ContinueWatching from "@/components/ContinueWatching";
import MediaSlider from "@/components/MediaSlider";
import {
  formatMovieForThumbnail,
  formatTVForThumbnail,
} from "@/lib/formatMediaForThumbnail";
import { getPopularMovies, getPopularTV } from "@/lib/getPopularData";
import { isProd } from "@/lib/isProd";
import InferNextPropsType from "infer-next-props-type";
import { GetServerSidePropsContext } from "next";

const Index = ({
  sliders
}: InferNextPropsType<typeof getServerSideProps>) => {
  return (
    <div className="mx-3 flex flex-col gap-8">
      {sliders.map((slider, i) => (
        <MediaSlider priority={i === 0} key={slider.text} {...slider} />
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

  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");  // 1 day cache

  sliders.push({
    text: "Popular movies",
    media_type: "movie" as const,
    media: await Promise.all(
      (await getPopularMovies())
        .slice(0, 15)
        .map(async (movie) => formatMovieForThumbnail(movie, doPlaceholders))
    ),
  });

  sliders.push({
    text: "Popular TV",
    media_type: "tv" as const,
    media: await Promise.all(
      (await getPopularTV())
        .slice(0, 15)
        .map(async (tv) => formatTVForThumbnail(tv, doPlaceholders))
    ),
  });

  return {
    props: {
      sliders,
    }
  };
};
