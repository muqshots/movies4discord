import ContinueWatching from "@/components/ContinueWatching";
import MediaSlider from "@/components/MediaSlider";
import {
  formatMovieForThumbnail,
  formatTVForThumbnail,
} from "@/lib/formatMediaForThumbnail";
import { getAvailablePopularMovies, getPopularMovies, getPopularTV } from "@/lib/getTmdbData";
import { isProd } from "@/lib/isProd";
import InferNextPropsType from "infer-next-props-type";

const Index = ({ sliders }: InferNextPropsType<typeof getStaticProps>) => {
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

export const getStaticProps = async () => {
  const doPlaceholders = isProd;
  const sliders = [];

  sliders.push({
    text: "Popular movies",
    media_type: "movie" as const,
    media: await Promise.all(
      (isProd ? await getAvailablePopularMovies() : await getPopularMovies())
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
    },
    revalidate: 129600, // Revalidate every 36 hours
  };
};
