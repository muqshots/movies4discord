import { getImageData } from "@/lib/getImageData";
import LandscapePlaceholder from "@/public/LandscapePlaceholder.jpg";
import ky from "ky";
import type { ImageProps } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { BsTvFill } from "react-icons/bs";
import { HiStar } from "react-icons/hi";
import { MdDelete, MdMovie } from "react-icons/md";

export interface MediaThumbnailProps {
  media_type: "movie" | "tv";
  id: number;
  title: string;
  season: number | string | null | undefined;
  episode: number | string | null | undefined;
  tvdbId: number | string | null | undefined;
  image: {
    src: ImageProps["src"] | null;
    b64: string | null;
  };
  release_date: string | null;
  rating: number;
  adult?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  percentage?: number;
  priority?: boolean;
  overview?: string
}

const MediaTypeLogos = {
  movie: MdMovie,
  tv: BsTvFill,
};

const MediaThumbnail = ({
  image,
  id,
  season,
  episode,
  tvdbId,
  title,
  media_type,
  release_date,
  rating,
  adult,
  onClick,
  onDelete,
  percentage,
  priority = false,
}: MediaThumbnailProps) => {
  const IconTag = MediaTypeLogos[media_type];

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    onClick ? (
      <div onClick={onClick}>{children}</div>
    ) : (
      <Link href={`/${media_type}/${id}`}>
        {children}
      </Link>
    );

  return (
    <div className="snap-start">
      <Wrapper>
        <div className="flex cursor-pointer flex-col gap-2">
          <div
            className="relative aspect-video w-[244px] shrink-0 rounded-lg border-2 border-transparent shadow-md shadow-darktheme transition duration-200 hover:scale-105 hover:border-white hover:shadow-white md:w-[324px]" // Add 4px to 16:9 w:h for borders
          >
            <Image
              {...getImageData(image.src || LandscapePlaceholder, image.b64)}
              priority={priority}
              fill
              sizes="(min-width: 768px) 320px, 240px"
              className="rounded-lg" // Need rounded here also to make it work with Safari
              alt={`${title} backdrop`}
            />
            {onDelete && (
              <div onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                ky.delete('/api/history', {
                  searchParams: {
                    media_type,
                    tmdbId: id,
                    tvdbId: tvdbId ? tvdbId : 0,
                    season: season ? season : 0,
                    episode: episode ? episode : 0
                  }
                }).then(() => onDelete());
              }} className="absolute top-0 right-0 bg-white text-black rounded-full p-2 m-2 transition-all duration-200 hover:scale-105 hover:bg-red-600 hover:text-white">
                <MdDelete className="h-[1.125rem] w-[1.125rem]" />
              </div>
            )}
            {percentage && (
              <div className="absolute bottom-0 h-1 w-full rounded-b-lg bg-gray-700">
                <div
                  style={{ width: `${percentage}%` }}
                  className="h-full rounded-bl-lg bg-red-600"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex w-60 flex-row justify-between md:w-80">
              <div className="w-10/12 truncate" title={title}>{title}</div>
              <IconTag className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex flex-row justify-between text-sm text-gray-400">
              <div>{release_date?.slice(0, 4) ?? "Unknown year"}</div>
              <div className="flex flex-row gap-1">
                <div>{rating.toFixed(1)}</div>
                <HiStar className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default MediaThumbnail;
