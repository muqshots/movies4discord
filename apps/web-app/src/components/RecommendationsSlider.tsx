import { MediaThumbnailProps } from "@/components/MediaThumbnail";
import { getImageData } from "@/lib/getImageData";
import PortraitPlaceholder from "@/public/PortraitPlaceholder.png";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiStar } from "react-icons/hi";

export interface RecommendationsSliderProps {
  recommendations: Omit<MediaThumbnailProps, "media_type">[];
  media_type: "movie" | "tv";
}

const RecommendationsSlider = ({
  recommendations,
  media_type,
}: RecommendationsSliderProps) => {
  const slider = useRef<HTMLDivElement>(null);
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(true);

  useEffect(() => {
    const sliderRef = slider.current;
    const handleScroll = () => {
      if (sliderRef) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef;
        setShowLeftChevron(scrollLeft > 0);
        setShowRightChevron(scrollLeft + clientWidth < scrollWidth);
      }
    };
    sliderRef?.addEventListener("scroll", handleScroll);
    return () => {
      sliderRef?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      <div className="scrollbar-hide flex snap-x snap-mandatory flex-row gap-6 overflow-x-auto pt-2" ref={slider}>
        {recommendations.length > 0
          ? recommendations.map(({ id, image, title, release_date, rating }) => (
              (<Link key={id} href={`/${media_type}/${id}`}>
                <div className="snap-start">
                  <div className="flex flex-col gap-2">
                    <div className="rounded-lg border-2 border-transparent shadow-md shadow-darktheme transition duration-200 hover:scale-105 hover:border-white hover:shadow-white">
                      <Image
                        {...getImageData(
                          image.src || PortraitPlaceholder,
                          image.b64
                        )}
                        style={{ "minHeight": "240px", "minWidth": "160px", "objectFit": "contain" }}
                        width={160}
                        height={240}
                        className="rounded-lg"
                        alt={`${title} poster`}
                      />
                    </div>
                    <div className="flex max-w-[160px] flex-col">
                      <div className="truncate whitespace-nowrap" title={title}>{title}</div>
                      <div className="flex flex-row justify-between text-sm text-gray-400">
                        <div>{release_date?.slice(0, 4) ?? "Unknown year"}</div>
                        <div className="flex flex-row gap-1">
                          {rating?.toFixed(1) ?? "N/A"}
                          <HiStar className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>)
            ))
          : "No recommendations for this movie :("}
      </div>
      <div className={`${showLeftChevron ? "" : "hidden"} absolute top-0 bottom-0 left-0 flex items-center z-10`}>
        <HiOutlineChevronLeft
          className="h-6 w-6 cursor-pointer ml-2"
          onClick={() =>
            slider.current?.scrollBy({ left: -600, behavior: "smooth" })
          }
        />
      </div>
      <div className={`${showRightChevron ? "" : "hidden"} absolute top-0 bottom-0 right-0 flex items-center z-10`}>
        <HiOutlineChevronRight
          className="h-6 w-6 cursor-pointer mr-2"
          onClick={() =>
            slider.current?.scrollBy({ left: 600, behavior: "smooth" })
          }
        />
      </div>
    </div>
  );
};

export default RecommendationsSlider;
