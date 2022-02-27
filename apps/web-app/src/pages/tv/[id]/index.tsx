import MediaPage from "@/components/MediaPage";
import { fetcher } from "@/lib/fetcher";
import { formatTVForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getImageUrl } from "@/lib/getImageUrl";
import { tmdb } from "@/lib/got";
import { GetShow } from "@/pages/api/show";
import LandscapePlaceholder from "@/public/LandscapePlaceholder.jpg";
import type {
  Credits,
  Images,
  Recommendations,
  TMDBListWrapper,
  TV,
  TVDetails,
  TVExternalIds,
  Videos,
} from "@movies4discord/interfaces";
import InferNextPropsType from "infer-next-props-type";
import ky from "ky";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { getPlaiceholder } from "plaiceholder";
import { useState } from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { HiBan, HiStar, HiX } from "react-icons/hi";
import useSWR from "swr";

const TVPage = ({
  tvdbId,
  ...props
}: InferNextPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { status } = useSession();

  const [seasonsShown, setSeasonsShown] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number>();

  const { data: showData } = useSWR<GetShow>(
    tvdbId && status === "authenticated" ? `/api/show?tvdbId=${tvdbId}` : null,
    fetcher,
    { onSuccess: (d) => !selectedSeason && setSelectedSeason(d.seasons[0]) }
  );

  return (
    <>
      <MediaPage
        media_type="tv"
        isAvailable={true}
        onStreamClick={() => setSeasonsShown(true)}
        {...props}
      />

      <div
        className={`${
          !seasonsShown ? "mt-[100vh]" : "mt-0"
        }  fixed inset-0 z-50 transition-all duration-200`}
      >
        <div
          className={`fixed z-[50] h-screen w-screen bg-black/50`}
          onClick={() => setSeasonsShown(false)}
        />

        <div className={`flex h-screen items-end justify-center`}>
          <div
            className={`relative z-50 h-[90%] w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl`}
          >
            <div className="relative h-full w-full overflow-y-auto overscroll-y-none rounded-t-3xl bg-[#1f213a] scrollbar-hide">
              <div
                className="inset-0 mt-3 ml-auto mr-[10px] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-500"
                onClick={() => setSeasonsShown(false)}
              >
                <HiX className="h-5 w-5" />
              </div>
              <div className="mx-10 flex flex-col gap-5">
                <div className="text-4xl font-bold">Seasons</div>
                <div className="-mt-1 flex flex-row flex-wrap gap-1">
                  {showData
                    ? showData?.seasons.map((s) => (
                        <div
                          key={s}
                          onClick={() => setSelectedSeason(s)}
                          className={`${
                            s === selectedSeason
                              ? "bg-white text-black"
                              : "bg-graything"
                          } cursor-pointer rounded-md py-2 px-3 text-xs transition duration-200 hover:bg-white hover:text-black`}
                        >
                          {s}
                        </div>
                      ))
                    : [...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="animate-pulse rounded-md bg-slate-700 py-2 px-3 text-xs"
                        >
                          &nbsp;
                        </div>
                      ))}
                </div>
                <hr className="border-gray-500" />
                <div className="text-3xl">Episodes</div>
                <div className="mb-10 flex flex-col">
                  {showData
                    ? showData?.episodes
                        .filter((e) => e.seasonNumber === selectedSeason)
                        .map((e) => {
                          const [IconTag, availableText] = e.available
                            ? [BsFillPlayFill, "Play"]
                            : [HiBan, "Request on discord"];

                          return (
                            <div key={e.id}>
                              <div className="flex flex-row flex-wrap gap-4 md:flex-nowrap">
                                <div className="group relative aspect-video h-44 rounded-lg">
                                  <Image
                                    src={e.image || LandscapePlaceholder}
                                    layout="responsive"
                                    width={160}
                                    height={90}
                                    alt={`${e.title} still`}
                                    className="rounded-lg"
                                  />
                                  <div
                                    className={`${
                                      e.available
                                        ? "cursor-pointer"
                                        : "cursor-not-allowed"
                                    } absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-lg bg-black/60 opacity-60 group-hover:opacity-100`}
                                    onClick={async () => {
                                      if (e.available) {
                                        const key = (
                                          await ky
                                            .post(`/api/key`, {
                                              searchParams: {
                                                tvdbId: tvdbId!,
                                                media_type: "tv",
                                                season: e.seasonNumber,
                                                episode: e.episodeNumber,
                                              },
                                            })
                                            .json<{ key: string }>()
                                        ).key;
                                        router.push(`/tv/${props.id}/${key}`);
                                      }
                                    }}
                                  >
                                    <div className="flex flex-col items-center justify-center">
                                      <IconTag className="h-10 w-10" />
                                      <div className="text-xl">
                                        {availableText}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <div>
                                    <div className="text-xl font-light">
                                      {e.episodeNumber}. {e.title}
                                    </div>
                                    <div className="hidden flex-row gap-2 text-sm text-gray-500 md:flex">
                                      <div>
                                        S{e.seasonNumber}E{e.episodeNumber}
                                      </div>
                                      <div>|</div>
                                      <div className="">{e.airDate}</div>
                                      <div>|</div>
                                      <div className="flex flex-row gap-1">
                                        <div>{e.rating || "Unknown"}</div>
                                        <HiStar className="h-5 w-5" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="line-clamp-5">
                                    {e.overview}
                                  </div>
                                </div>
                              </div>
                              <hr className="my-4 mx-1 border-gray-500" />
                            </div>
                          );
                        })
                    : [...Array(5)].map((_, i) => (
                        <div key={i}>
                          <div className="flex flex-row flex-wrap gap-4 md:flex-nowrap">
                            <div className="aspect-video h-44 animate-pulse rounded-lg bg-slate-700" />
                            <div className="flex grow flex-col gap-2">
                              <div className="h-12 w-full animate-pulse rounded-lg bg-slate-700" />
                              <div className="h-[120px] w-full animate-pulse rounded-lg bg-slate-700" />
                            </div>
                          </div>
                          <hr className="my-4 mx-1 border-gray-500" />
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // pre-generate popular movies
  const popularTVW = await tmdb.get("tv/popular").json<TMDBListWrapper<TV>>();

  return {
    paths: popularTVW.results.map((tv) => {
      return { params: { id: tv.id.toString() } };
    }),
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  // Disabled for now as takes too long when page is not pre-generated
  // Can enable for pregenerated pages when nextjs adds a flag to check if its fallback
  const doPlaceholders = false;
  const okLanguages = ["en", "en-US", null];

  const id = params?.id as string;

  let TVData;
  try {
    TVData = await tmdb
      .get(`tv/${id}`, {
        searchParams: {
          append_to_response:
            "images,videos,credits,recommendations,external_ids",
          include_image_language: okLanguages.join(","),
          include_video_language: okLanguages.join(","),
        },
      })
      .json<
        TVDetails &
          Images &
          Videos &
          Credits &
          Recommendations<TV> &
          TVExternalIds
      >();
  } catch (e) {
    return {
      notFound: true,
      revalidate: 10,
    };
  }

  const backdropPath = TVData.backdrop_path;
  const posterPath =
    (TVData.images.posters[1] ?? TVData.images.posters[0])?.file_path ?? null;
  const logoPath = TVData.images.logos[0]?.file_path ?? null;
  const ytKey =
    TVData.videos.results.filter(
      (video) =>
        video.site === "YouTube" && video.official && video.type === "Trailer"
    )[0]?.key ??
    TVData.videos.results.filter(
      (video) => video.site === "YouTube" && video.official
    )[0]?.key ??
    null;

  const backdropUrl = getImageUrl(backdropPath);
  const posterUrl = getImageUrl(posterPath);
  const logoUrl = getImageUrl(logoPath);

  let backdropB64 = null;
  let posterB64 = null;

  if (doPlaceholders) {
    backdropB64 = backdropUrl
      ? (await getPlaiceholder(backdropUrl)).base64
      : null;
    posterB64 = posterUrl ? (await getPlaiceholder(posterUrl)).base64 : null;
  }

  const tvdbId = TVData.external_ids.tvdb_id ?? null;

  return {
    props: {
      id: TVData.id,
      title: TVData.name,
      overview: TVData.overview,
      poster: {
        url: posterUrl,
        b64: posterB64,
      },
      backdrop: { url: backdropUrl, b64: backdropB64 },
      logoUrl,
      ytKey,
      genres: TVData.genres.slice(0, 4),
      rating: TVData.vote_average,
      runtime: TVData.episode_run_time[0] ?? 0,
      numberOfEpisodes: TVData.number_of_episodes,
      releaseDate: TVData.first_air_date || null,
      cast: TVData.credits.cast.slice(0, 15).map((p) => ({
        name: p.name,
        id: p.id,
        image: getImageUrl(p.profile_path),
        character: p.character,
      })),
      recommendations: await Promise.all(
        TVData.recommendations.results
          .slice(0, 15)
          .map(async (t) => formatTVForThumbnail(t, false, true))
      ),

      tvdbId,
    },
    revalidate: 604800, // Revalidate every week
  };
};

export default TVPage;
