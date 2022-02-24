import MediaSlider from "@/components/MediaSlider";
import { fetcher } from "@/lib/fetcher";
import {
  formatMovieForThumbnail,
  formatTVForThumbnail,
} from "@/lib/formatMediaForThumbnail";
import { getPopularMovies, getPopularTV } from "@/lib/getTmdbData";
import { isProd } from "@/lib/isProd";
import InferNextPropsType from "infer-next-props-type";
import ky from "ky";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { GetHistory } from "./api/history";

const Index = ({ sliders }: InferNextPropsType<typeof getStaticProps>) => {
  const { data: historyJson } = useSWR<GetHistory>(
    `/api/history?take=20`,
    fetcher,
    {}
  );

  const { status } = useSession();
  const router = useRouter();

  return (
    <>
      <div className="mx-3 flex flex-col gap-8">
        {status !== "unauthenticated" && historyJson?.history.length !== 0 ? (
          <MediaSlider
            text="Continue watching"
            media={historyJson?.history.map((item) => ({
              ...item,
              onClick: async () => {
                const key = (
                  await ky
                    .post("/api/key", {
                      searchParams: {
                        media_type: item.media_type,
                        tmdbId: item.id,
                        tvdbId: item.tvdbId,
                        season: item.season,
                        episode: item.episode,
                      },
                    })
                    .json<{ key: string }>()
                ).key;
                router.push(`/${item.media_type}/${item.id}/${key}`);
              },
            }))}
          />
        ) : null}

        {sliders.map((slider) => (
          <MediaSlider key={slider.text} {...slider} />
        ))}
        <div className="bg-spacer flex h-60 flex-row items-center justify-center rounded-lg border-2 border-transparent shadow-md transition duration-200 hover:border-white hover:shadow-white">
          <span className="text-xl font-semibold">Spacer</span>
        </div>
      </div>
    </>
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
      (
        await getPopularMovies()
      ).map(async (movie) => formatMovieForThumbnail(movie, doPlaceholders))
    ),
  });

  sliders.push({
    text: "Popular TV",
    media_type: "tv" as const,
    media: await Promise.all(
      (
        await getPopularTV()
      ).map(async (tv) => formatTVForThumbnail(tv, doPlaceholders))
    ),
  });

  return {
    props: {
      sliders,
    },
    revalidate: 129600, // Revalidate every 36 hours
  };
};
