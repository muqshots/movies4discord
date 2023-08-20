import { getImageData } from "@/lib/getImageData";
import LandscapePlaceholder from "@/public/LandscapePlaceholder.jpg";
import PortraitPlaceholder from "@/public/PortraitPlaceholder.png";
import { CombinedCredits } from "@movies4discord/interfaces";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { useRef, useState } from "react";
import { MediaThumbnailProps } from "./MediaThumbnail";
import RecommendationsSlider from "./RecommendationsSlider";

interface PersonPageProps {
    id: number;
    name: string;
    biography: string | null;
    poster: { url: string | null; b64: string | null };
    backdrop: { url: string | null; };
    birthday: string | null;
    movie_credits: Omit<MediaThumbnailProps, "media_type">[];
    tv_credits: Omit<MediaThumbnailProps, "media_type">[];
}

const PersonPage = ({
    id,
    name,
    biography,
    poster,
    backdrop,
    birthday,
    movie_credits,
    tv_credits,
}: PersonPageProps) => {
  const [tab, setTab] = useState<"movie" | "tv">("movie");
  const [showFullBio, setShowFullBio] = useState(false);

  const bioLimit = 150;
  const shortBio = biography?.substring(0, bioLimit);
  const isShortBio = biography && biography.length > bioLimit;

  return (
    <>
      <NextSeo
        title={name}
        description={biography || "No Description Available."}
        openGraph={{
          title: name,
          description: biography || "No Description Available.",
          images: [
            {
              url: poster.url || PortraitPlaceholder.src,
              width: 500,
              height: 750,
              alt: `${name} poster`,
            },
          ],
        }}
      />

      <div className="relative -mt-20 h-[22rem]">
        <Image
          {...getImageData(backdrop.url || LandscapePlaceholder, null)}
          priority={true}
          layout="fill"
          className="opacity-[0.7]"
          objectFit="cover"
          objectPosition={"center"}
          alt={`${name} backdrop`}
        />
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
                alt={`${name} poster`}
                className="rounded-3xl"
              />
            </div>
          </div>

          <div className="mb-2 flex flex-col items-center justify-start gap-3 md:items-start">
            <div className="mb-2 text-center text-2xl font-semibold md:text-left md:text-4xl">
              {name}
            </div>
            <div className="text-center text-gray-400 md:text-left">
              {isShortBio && !showFullBio
                ? `${shortBio}... `
                : biography || "No Description Available."}
              {isShortBio && (
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => setShowFullBio(!showFullBio)}
                >
                  {showFullBio ? " Show less" : "Show more"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8 md:justify-start">
          <button
            className={`text-xl font-medium ${
              tab === "movie" ? "text-gray-600" : "text-gray-300"
            }`}
            onClick={() => setTab("movie")}
          >
            Movies
          </button>
          <button
            className={`text-xl font-medium ${
              tab === "tv" ? "text-gray-600" : "text-gray-300"
            }`}
            onClick={() => setTab("tv")}
          >
            TV Shows
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tab === "movie" &&
            <RecommendationsSlider
              recommendations={movie_credits}
              media_type="movie"
            />
          }
          {tab === "tv" &&
            <RecommendationsSlider
              recommendations={tv_credits}
              media_type="tv"
            />
          }
        </div>
      </div>
    </>
  );
};

export default PersonPage;
