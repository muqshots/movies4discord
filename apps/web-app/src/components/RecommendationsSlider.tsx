import { MediaThumbnailProps } from "@/components/MediaThumbnail";
import { getImageData } from "@/lib/getImageData";
import PortraitPlaceholder from "@/public/PortraitPlaceholder.png";
import Image from "next/image";
import Link from "next/link";
import { HiStar } from "react-icons/hi";

export interface RecommendationsSliderProps {
  recommendations: Omit<MediaThumbnailProps, "media_type">[];
  media_type: "movie" | "tv";
}

const RecommendationsSlider = ({
  recommendations,
  media_type,
}: RecommendationsSliderProps) => {
  return (
    <div className="scrollbar-hide flex snap-x snap-mandatory flex-row gap-6 overflow-x-auto">
      {recommendations.length > 0
        ? recommendations.map(({ id, image, title, release_date, rating }) => (
            <Link key={id} href={`/${media_type}/${id}`}>
              <a>
                <div className="snap-start">
                  <div className="flex flex-col gap-2">
                    <div className="rounded-lg">
                      <Image
                        {...getImageData(
                          image.src || PortraitPlaceholder,
                          image.b64
                        )}
                        height={240}
                        width={160}
                        layout="fixed"
                        className="rounded-lg"
                        alt={`${title} poster`}
                      />
                    </div>
                    <div className="flex max-w-[160px] flex-col">
                      <div className="truncate whitespace-nowrap">{title}</div>
                      <div className="flex flex-row justify-between text-sm text-gray-400">
                        <div>{release_date?.slice(0, 4) ?? "Unknown year"}</div>
                        <div className="flex flex-row gap-1">
                          <div>{rating.toFixed(1)}</div>
                          <HiStar className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))
        : "No recommendations for this movie :("}
    </div>
  );
};

export default RecommendationsSlider;
