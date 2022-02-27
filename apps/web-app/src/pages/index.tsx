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
  const { status } = useSession();

  const { data: historyJson } = useSWR<GetHistory>(
    status === "authenticated" ? `/api/history?take=20` : null,
    fetcher
  );

  const router = useRouter();

  return (
    <>
      <div className="mx-3 flex flex-col gap-8">
        {
          <MediaSlider
            text="Continue watching"
            media={
              status === "unauthenticated"
                ? "Login to continue watching"
                : historyJson?.history.length === 0
                ? "Go watch some stuff!"
                : historyJson?.history.map((item) => ({
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
                  }))
            }
          />
        }

        {sliders.map((slider) => (
          <MediaSlider key={slider.text} {...slider} />
        ))}
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
    },
    revalidate: 129600, // Revalidate every 36 hours
  };
};
