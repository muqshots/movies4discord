import { fetcher } from "@/lib/fetcher";
import { getImageData } from "@/lib/getImageData";
import LandscapePlaceholder from "@/public/LandscapePlaceholder.jpg";
import PortraitPlaceholder from "@/public/PortraitPlaceholder.png";
import { Genre } from "@movies4discord/interfaces";
import ky from "ky";
import { signIn, useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { useState } from "react";
import { IconType } from "react-icons";
import {
  BsFillBookmarkCheckFill,
  BsFillBookmarkFill,
  BsFillBookmarkPlusFill,
  BsFillPlayFill,
} from "react-icons/bs";
import { HiStar } from "react-icons/hi";
import useSWR from "swr";
import CastSlider, { CastSliderProps } from "./CastSlider";
import GenreButton from "./GenreButton";
import RecommendationsSlider, {
  RecommendationsSliderProps,
} from "./RecommendationsSlider";
import Trailer from "./Trailer";

interface MediaPageProps {
  media_type: "movie" | "tv";
  isAvailable: boolean | undefined;
  onStreamClick: (() => Promise<void> | void) | undefined;
  extraButton?: {
    text: string;
    icon: IconType;
    disabled: boolean;
    onClick: () => Promise<void> | void | null;
  };

  id: number;
  title: string;
  overview: string | null;
  backdrop: { url: string | null; b64: string | null };
  poster: { url: string | null; b64: string | null };
  logoUrl: string | null;
  ytKey: string | null;
  genres: Genre[];
  runtime: number;
  numberOfEpisodes?: number;
  rating: number;
  releaseDate: string | null;
  seriesStatus?: string | null;
  cast: CastSliderProps["cast"];
  recommendations: RecommendationsSliderProps["recommendations"];
}

const MediaPage = ({
  media_type,
  isAvailable,
  onStreamClick,
  extraButton,

  id,
  title,
  overview,
  backdrop,
  poster,
  logoUrl,
  ytKey,
  genres,
  runtime,
  numberOfEpisodes,
  rating,
  releaseDate,
  seriesStatus = null,
  cast,
  recommendations,
}: MediaPageProps) => {
  const [trailerShown, setTrailerShown] = useState(false);
  const { status } = useSession();

  const { data: watchlist, mutate } = useSWR<{ isInWatchlist: boolean }>(
    status === "authenticated"
      ? `/api/watchlist?tmdbId=${id}&isShow=${media_type === "tv"}`
      : null,
    fetcher
  );

  const inWatchlist = watchlist?.isInWatchlist;
  const WatchlistIcon =
    inWatchlist === undefined
      ? BsFillBookmarkFill
      : inWatchlist
      ? BsFillBookmarkCheckFill
      : BsFillBookmarkPlusFill;

  const ExtraButtonIcon = extraButton?.icon;

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
        <div className="absolute bottom-0 h-8 w-full rounded-t-full bg-theme" />
      </div>

      <div className="mx-3 flex flex-col gap-8 scrollbar-hide md:ml-6">
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
                  media_type={media_type}
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
              <div>
                {media_type === "movie"
                  ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
                  : `${numberOfEpisodes} x ${runtime}m`}
              </div>
              <div>|</div>
              <div>{releaseDate?.slice(0, 4) ?? "Unknown year"}</div>
              {seriesStatus ? (
                <>
                  <div>|</div>
                  <div>{seriesStatus}</div>
                </>
              ) : null}
            </div>

            <div className="flex flex-row gap-1.5">
              <button
                disabled={!isAvailable && status === "authenticated"}
                className={`${
                  isAvailable === true || status === "unauthenticated"
                    ? "hover:bg-white hover:text-black"
                    : "cursor-not-allowed"
                } flex flex-row items-center gap-1 rounded-md bg-graything py-2 px-4 transition duration-200`}
                onClick={
                  status === "unauthenticated"
                    ? () => signIn("discord")
                    : onStreamClick
                }
              >
                <BsFillPlayFill className="h-5 w-5" />
                <div className="text-sm">
                  {status !== "authenticated"
                    ? "Login"
                    : isAvailable === true
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
                    await ky(
                      `/api/watchlist?tmdbId=${id}&isShow=${
                        media_type === "tv"
                      }`,
                      {
                        method: inWatchlist ? "DELETE" : "POST",
                      }
                    );
                    mutate();
                  } else {
                    signIn("discord");
                  }
                }}
              >
                <WatchlistIcon className="h-[1.125rem] w-[1.125rem]" />
                <div className="text-sm">{inWatchlist ? "Saved" : "Save "}</div>
              </button>

              {extraButton && ExtraButtonIcon && (
                <button
                  className={`${
                    !extraButton.disabled
                      ? "hover:bg-white hover:text-black"
                      : "cursor-not-allowed"
                  } flex flex-row items-center gap-1 rounded-md bg-graything py-2 px-4 transition duration-200`}
                  onClick={extraButton.onClick}
                >
                  <ExtraButtonIcon className="h-[1.125rem] w-[1.125rem]" />
                  <div className="text-sm">{extraButton.text}</div>
                </button>
              )}
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
            media_type={media_type}
          />
        </div>
      </div>
    </>
  );
};

export default MediaPage;
