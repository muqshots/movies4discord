import MediaPage from "@/components/MediaPage";
import { fetcher } from "@/lib/fetcher";
import { formatMovieForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getImageUrl } from "@/lib/getImageUrl";
import { tmdb } from "@/lib/got";
import { CheckMovieAvailability } from "@/pages/api/movie";
import type {
  Credits,
  Images,
  Movie,
  MovieDetails,
  MovieWithMediaType,
  Recommendations,
  TMDBListWrapper,
  Videos,
} from "@movies4discord/interfaces";
import InferNextPropsType from "infer-next-props-type";
import ky from "ky";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getPlaiceholder } from "plaiceholder";
import { useEffect, useState } from "react";
import {
  HiBadgeCheck,
  HiDotsCircleHorizontal,
  HiRefresh,
  HiSearch,
} from "react-icons/hi";
import useSWR from "swr";

const MoviePage = (props: InferNextPropsType<typeof getStaticProps>) => {
  const { status, data: session } = useSession();

  const { data: radarrData, mutate } = useSWR<CheckMovieAvailability>(
    status === "authenticated" ? `/api/movie?tmdbId=${props.id}` : null,
    fetcher
  );

  const router = useRouter();

  const [actionButtonClicked, setActionButtonClicked] = useState(false);
  const [actionButtonDone, setActionButtonDone] = useState(false);

  const onStreamClick = radarrData?.available
    ? async () => {
        const key = (
          await ky
            .post("/api/key", {
              searchParams: { media_type: "movie", tmdbId: props.id },
            })
            .json<{ key: string }>()
        ).key;
        router.push(`/movie/${props.id}/${key}`);
      }
    : undefined;

  return (
    <MediaPage
      media_type="movie"
      isAvailable={radarrData?.available}
      onStreamClick={onStreamClick}
      extraButton={
        radarrData?.available !== undefined &&
        status === "authenticated" &&
        session.admin
          ? {
              text: actionButtonDone
                ? "Done!"
                : actionButtonClicked
                ? "Doing da ting"
                : radarrData.available
                ? "Replace"
                : "Search",
              icon: actionButtonDone
                ? HiBadgeCheck
                : actionButtonClicked
                ? HiDotsCircleHorizontal
                : radarrData.available
                ? HiRefresh
                : HiSearch,
              disabled: !!actionButtonDone || actionButtonClicked,
              onClick: actionButtonClicked
                ? () => null
                : async () => {
                    setActionButtonClicked(true);
                    radarrData.available
                      ? await ky.post(`/api/movie`, {
                          searchParams: {
                            action: "replace",
                            id: radarrData.id!,
                            tmdbId: props.id,
                            movieFileId: radarrData.movieFileId!,
                          },
                        })
                      : await ky.post(`/api/movie`, {
                          searchParams: {
                            action: "search",
                            id: radarrData.id ?? 0,
                            tmdbId: props.id,
                          },
                        });
                    mutate();
                    setActionButtonDone(true);
                    setActionButtonClicked(false);
                  },
            }
          : undefined
      }
      {...props}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // pre-generate popular movies
  const popularMoviesW = await tmdb
    .get("movie/popular")
    .json<TMDBListWrapper<Movie>>();

  return {
    paths: popularMoviesW.results.map((movie) => {
      return { params: { id: movie.id.toString() } };
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

  let movieData;
  try {
    movieData = await tmdb
      .get(`movie/${id}`, {
        searchParams: {
          append_to_response: "images,videos,credits,recommendations",
          include_image_language: okLanguages.join(","),
          include_video_language: okLanguages.join(","),
        },
      })
      .json<
        MovieDetails & Images & Videos & Credits & Recommendations<MovieWithMediaType>
      >();
  } catch (e) {
    return {
      notFound: true,
      revalidate: 10,
    };
  }

  const backdropPath = movieData.backdrop_path;
  const posterPath =
    (movieData.images.posters[1] ?? movieData.images.posters[0])?.file_path ??
    null;
  const logoPath = movieData.images.logos[0]?.file_path ?? null;
  const ytKey =
    movieData.videos.results
      .filter((video) => video.site === "YouTube" && video.type === "Trailer")
      .sort((a, b) => (a.official ? -1 : 1))[0]?.key ?? null;

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
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      poster: {
        url: posterUrl,
        b64: posterB64,
      },
      backdrop: { url: backdropUrl, b64: backdropB64 },
      logoUrl,
      ytKey,
      genres: movieData.genres.slice(0, 4),
      rating: movieData.vote_average,
      runtime: movieData.runtime ?? 0,
      releaseDate: movieData.release_date || null,
      cast: movieData.credits.cast.slice(0, 15).map((p) => ({
        name: p.name,
        id: p.id,
        image: getImageUrl(p.profile_path),
        character: p.character,
      })),
      recommendations: await Promise.all(
        movieData.recommendations.results
          .filter(r => r.media_type === "movie")
          .slice(0, 15)
          .map(async (m) => formatMovieForThumbnail(m, false, true))
      ),
    },
    revalidate: 604800, // Revalidate every week
  };
};

export default MoviePage;
