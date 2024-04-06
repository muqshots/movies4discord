import PersonPage from "@/components/PersonPage";
import { formatMovieForThumbnail, formatTVForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getImageUrl } from "@/lib/getImageUrl";
import { tmdb } from "@/lib/got";
import type {
  CombinedCredits,
  Person,
  PersonImages,
  TMDBListWrapper,
  TVExternalIds,
} from "@movies4discord/interfaces";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { getPlaiceholder } from "plaiceholder";

const ComradePage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <PersonPage
      {...props}
    />
  )
};

export const getStaticPaths: GetStaticPaths = async () => {
  const popularPeople = await tmdb.get("person/popular").json<TMDBListWrapper<Person>>();

  return {
    paths: popularPeople.results.map((p) => {
      return { params: { id: p.id.toString() } };
    }),
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const doPlaceholders = false;
  const okLanguages = ["en", "en-US", null];

  const id = params?.id as string;

  let ActorData;
  try {
    ActorData = await tmdb
      .get(`person/${id}`, {
        searchParams: {
          append_to_response:
            "combined_credits,external_ids,images",
          include_image_language: okLanguages.join(","),
          include_video_language: okLanguages.join(","),
        },
      })
      .json<
        Person &
          PersonImages &
          CombinedCredits &
          TVExternalIds
      >();
  } catch (e) {
    return {
      notFound: true,
      revalidate: 10,
    };
  }

  const posterPath = ActorData.profile_path ?? null;
  const posterUrl = getImageUrl(posterPath);

  let posterB64 = null;

  if (doPlaceholders) {
    posterB64 = posterUrl ? (await getPlaiceholder(posterUrl)).base64 : null;
  }

  const credits = ActorData.combined_credits.cast;

  const movie_credits = credits
    .filter((show) => show.media_type === "movie")
    .sort((a, b) => {
      return b.release_date.localeCompare(a.release_date);
    })
    .slice(0, 25)
    .map(async (movie) => await formatMovieForThumbnail(movie, false, true));
    
  const tv_credits = credits
    .filter((show) => show.media_type === "tv")
    .sort((a, b) => {
      return b.first_air_date.localeCompare(a.first_air_date);
    })
    .slice(0, 25)
    .map(async (tv) => await formatTVForThumbnail(tv, false, true));

  await Promise.all([...movie_credits, ...tv_credits]);

  const firstMovieOrTV = credits
    .sort((a, b) => {
      const aDate = a.release_date ?? a.first_air_date;
      const bDate = b.release_date ?? b.first_air_date;
      return bDate.localeCompare(aDate);
    })[0];

  const backdropPath = firstMovieOrTV?.backdrop_path ?? null;
  const backdropUrl = getImageUrl(backdropPath);

  return {
    props: {
      id: ActorData.id,
      name: ActorData.name,
      biography: ActorData.biography,
      poster: {
        url: posterUrl,
        b64: posterB64,
      },
      backdrop: {
        url: backdropUrl,
      },
      popularity: ActorData.popularity,
      birthday: ActorData.birthday,
      movie_credits: await Promise.all(movie_credits),
      tv_credits: await Promise.all(tv_credits),
    },
    revalidate: 604800, // Revalidate every week
  };
};

export default ComradePage;