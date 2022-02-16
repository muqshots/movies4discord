import { getImageData } from "@/lib/getImageData";
import LandscapePlaceholder from "@/public/LandscapePlaceholder.jpg";
import type { ImageProps } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { BsTvFill } from "react-icons/bs";
import { HiStar } from "react-icons/hi";
import { MdMovie } from "react-icons/md";

export interface MediaThumbnailProps {
  media_type: "movie" | "tv";
  id: number;
  title: string;
  image: {
    src: ImageProps["src"] | null;
    b64: string | null;
  };
  release_date: string | null;
  rating: number;
}

const MediaTypeLogos = {
  movie: MdMovie,
  tv: BsTvFill,
};

const MediaThumbnail = ({
  image,
  id,
  title,
  media_type,
  release_date,
  rating,
}: MediaThumbnailProps) => {
  const IconTag = MediaTypeLogos[media_type];

  return (
    <div className="snap-start">
      <Link href={`/${media_type}/${id}`}>
        <a>
          <div className="flex flex-col gap-2">
            <div
              className="shadow-darktheme aspect-video w-[244px] shrink-0 rounded-lg border-2 border-transparent shadow-md transition duration-200 hover:scale-105 hover:border-white hover:shadow-white md:w-[324px]" // Add 4px to 16:9 w:h for borders
            >
              <Image
                {...getImageData(image.src || LandscapePlaceholder, image.b64)}
                layout="responsive"
                width={160}
                height={90}
                sizes="(min-width: 768px) 320px, 240px"
                className="rounded-lg" // Need rounded here also to make it work with Safari
                alt={`${title} backdrop`}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex w-60 flex-row justify-between md:w-80">
                <div className="w-10/12 truncate">{title}</div>
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
        </a>
      </Link>
    </div>
  );
};

export default MediaThumbnail;
