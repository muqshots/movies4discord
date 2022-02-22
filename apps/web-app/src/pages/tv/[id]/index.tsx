import MediaPage from "@/components/MediaPage";
import { formatTVForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getImageUrl } from "@/lib/getImageUrl";
import { tmdb } from "@/lib/got";
import type {
  Credits,
  Images,
  Recommendations,
  TMDBListWrapper,
  TV,
  TVDetails,
  Videos,
} from "@movies4discord/interfaces";
import InferNextPropsType from "infer-next-props-type";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import { getPlaiceholder } from "plaiceholder";

const TVPage = (props: InferNextPropsType<typeof getStaticProps>) => {
  const router = useRouter();

  const onStreamClick = () => {
    router.push(`/tv/${props.id}/stream`);
  };

  return (
    <MediaPage
      media_type="tv"
      isAvailable={true}
      onStreamClick={onStreamClick}
      {...props}
    />
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
          append_to_response: "images,videos,credits,recommendations",
          include_image_language: okLanguages.join(","),
          include_video_language: okLanguages.join(","),
        },
      })
      .json<TVDetails & Images & Videos & Credits & Recommendations<TV>>();
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
    },
    revalidate: 604800, // Revalidate every week
  };
};

export default TVPage;
