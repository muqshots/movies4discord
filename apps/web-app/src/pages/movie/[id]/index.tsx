import CastSlider from "@/components/CastSlider";
import GenreButton from "@/components/GenreButton";
import RecommendationsSlider from "@/components/RecommendationsSlider";
import Trailer from "@/components/Trailer";
import { fetcher } from "@/lib/fetcher";
import { formatMovieForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getImageData } from "@/lib/getImageData";
import { getImageUrl } from "@/lib/getImageUrl";
import { tmdb } from "@/lib/got";
import { CheckMovieAvailability } from "@/pages/api/available/movie";
import type {
  Credits,
  Images,
  Movie,
  MovieDetails,
  Recommendations,
  TMDBListWrapper,
  Videos,
} from "@movies4discord/interfaces";
import LandscapePlaceholder from "@/public/LandscapePlaceholder.jpg";
import PortraitPlaceholder from "@/public/PortraitPlaceholder.png";
import InferNextPropsType from "infer-next-props-type";
import ky from "ky";
import { GetStaticPaths, GetStaticPropsContext } from "next";
import { signIn, useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { getPlaiceholder } from "plaiceholder";
import { useState } from "react";
import {
  BsFillBookmarkCheckFill,
  BsFillBookmarkFill,
  BsFillBookmarkPlusFill,
  BsFillPlayFill,
} from "react-icons/bs";
import { HiStar } from "react-icons/hi";
import useSWR from "swr";

const MoviePage = ({
  id,
  title,
  overview,
  backdrop,
  poster,
  logoUrl,
  ytKey,
  genres,
  runtime,
  rating,
  releaseDate,
  cast,
  recommendations,
}: InferNextPropsType<typeof getStaticProps>) => {
  const [trailerShown, setTrailerShown] = useState(false);
  const { status } = useSession();

  const { data: available } = useSWR<CheckMovieAvailability>(
    `/api/available/movie?tmdbId=${id}`,
    fetcher
  );
  const isAvailable = available?.available;

  const { data: watchlist, mutate } = useSWR<{ isInWatchlist: boolean }>(
    `/api/watchlist?tmdbId=${id}&isShow=${false}`,
    fetcher
  );
  const inWatchlist = watchlist?.isInWatchlist;
  const WatchlistIcon =
    inWatchlist === undefined
      ? BsFillBookmarkFill
      : inWatchlist
      ? BsFillBookmarkCheckFill
      : BsFillBookmarkPlusFill;

  return (
    <>
      <NextSeo
        title={title}
        description={overview || "No Description Available."}
        openGraph={{
          images: [
            {
              url: backdrop.url ?? "https://http.cat/404",
              type: "image/jpeg",
              alt: `${title} backdrop`,
            },
          ],
        }}
      />

      {trailerShown && (
        <Trailer onClose={() => setTrailerShown(false)} ytKey={ytKey ?? ""} />
      )}

      <div className="relative -mt-20 h-[22rem]">
        <Image
          {...getImageData(backdrop.url || LandscapePlaceholder, backdrop.b64)}
          priority={true}
          layout="fill"
          className="opacity-[0.7]"
          objectFit="cover"
          objectPosition={backdrop.url ? "top" : "center"}
          alt={`${title} backdrop`}
        />
        {logoUrl && (
          <div className="absolute inset-[50%] h-full max-h-[70%] w-full max-w-[75%] translate-x-[-50%] translate-y-[-60%] md:max-w-2xl md:translate-y-[-50%]">
            <Image
              src={logoUrl}
              layout="fill"
              objectFit="contain"
              alt={`${title} logo`}
            />
          </div>
        )}
        <div className="bg-theme absolute bottom-0 h-8 w-full rounded-t-full" />
      </div>

      <div className="scrollbar-hide mx-3 flex flex-col gap-8 md:ml-6">
        <div className="grid gap-8 md:grid-cols-[min-content,auto]">
          <div className="mx-auto -mt-32 aspect-[1/1.5] w-56 rounded-3xl">
            <div className="group relative">
              <Image
                {...getImageData(poster.url || PortraitPlaceholder, poster.b64)}
                layout="responsive"
                priority
                height={1.5}
                width={1}
                sizes="(min-width: 768px) 288px, 208px"
                alt={`${title} poster`}
                className="rounded-3xl"
              />
              <div
                className="absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-3xl bg-black/60 opacity-0 transition duration-200 group-hover:opacity-100"
                onClick={() => setTrailerShown(true)}
              >
                <div className="flex flex-col items-center justify-center">
                  <BsFillPlayFill className="h-10 w-10" />
                  <div className="text-xl">Trailer</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-2 flex flex-col items-center justify-end gap-3 md:items-start">
            <div className="mb-2 text-center text-2xl font-semibold md:text-left md:text-4xl">
              {title}
            </div>
            <div className="flex flex-row flex-wrap gap-1">
              {genres.map((genre) => (
                <GenreButton
                  key={genre.id}
                  genre={genre}
                  media_type="movie"
                  selected={false}
                />
              ))}
            </div>

            <div className="flex flex-row gap-2 text-sm text-gray-500">
              <div className="flex flex-row gap-1">
                <div>{rating.toFixed(1)}</div>
                <HiStar className="h-5 w-5" />
              </div>
              <div>|</div>
              <div>{`${Math.floor(runtime / 60)}h ${runtime % 60}m`}</div>
              <div>|</div>
              <div>{releaseDate?.slice(0, 4) ?? "Unknown year"}</div>
            </div>

            <div className="flex flex-row gap-1.5">
              <button
                disabled={!isAvailable}
                className={`${
                  isAvailable
                    ? "hover:bg-white hover:text-black"
                    : "cursor-not-allowed"
                } bg-graything flex flex-row items-center gap-1 rounded-md py-2 px-4 transition duration-200`}
                onClick={
                  isAvailable
                    ? () => console.log("Streaming")
                    : () => {
                        console.log("Not available");
                      }
                }
              >
                <BsFillPlayFill className="h-5 w-5" />
                <div className="text-sm">
                  {isAvailable === true
                    ? "Stream"
                    : isAvailable === false
                    ? "Request on discord"
                    : "Loading"}
                </div>
              </button>
              <button
                className="flex flex-row items-center gap-1 rounded-md bg-blue-500 py-2 px-4 transition active:bg-blue-600"
                onClick={async () => {
                  if (status === "authenticated") {
                    mutate({ isInWatchlist: !inWatchlist }, false);
                    await ky(`/api/watchlist?tmdbId=${id}&isShow=${false}`, {
                      method: inWatchlist ? "DELETE" : "POST",
                    });
                    mutate();
                  } else {
                    signIn("discord");
                  }
                }}
              >
                <WatchlistIcon className="h-[1.125rem] w-[1.125rem]" />
                <div className="text-sm">{inWatchlist ? "Saved" : "Save "}</div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-4xl font-light">Overview</div>
          <div className="text-gray-500">{overview}</div>

          <hr />
          <div className="text-4xl font-light">Cast</div>
          <CastSlider cast={cast} />

          <hr />
          <div className="text-4xl font-light">Recommendations</div>
          <RecommendationsSlider
            recommendations={recommendations}
            media_type="movie"
          />
        </div>
      </div>
    </>
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
      .json<MovieDetails & Images & Videos & Credits & Recommendations>();
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
    movieData.videos.results.filter(
      (video) =>
        video.site === "YouTube" && video.official && video.type === "Trailer"
    )[0]?.key ?? null;

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
      runtime: movieData.runtime,
      releaseDate: movieData.release_date || null,
      cast: movieData.credits.cast.slice(0, 15).map((p) => ({
        name: p.name,
        id: p.id,
        image: getImageUrl(p.profile_path),
        character: p.character,
      })),
      recommendations: await Promise.all(
        movieData.recommendations.results
          .slice(0, 15)
          .map(async (m) => formatMovieForThumbnail(m, false, true))
      ),
    },
    revalidate: 604800, // Revalidate every week
  };
};

export default MoviePage;
