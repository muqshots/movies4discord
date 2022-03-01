import MediaThumbnail, {
  MediaThumbnailProps,
} from "@/components/MediaThumbnail";
import { UIEvent, useEffect, useRef, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { throttle } from "throttle-debounce";
import ShimmerThumbnail from "./ShimmerThumbnail";

interface MediaSliderWithItems {
  priority?: boolean;

  text: string;
  media_type: "movie" | "tv";
  media: Omit<MediaThumbnailProps, "media_type">[];
}

interface ContinueWatchingSlider {
  priority?: boolean;

  text: string;
  media?: MediaThumbnailProps[] | string;

  media_type?: never;
}

export type MediaSliderProps = ContinueWatchingSlider | MediaSliderWithItems;

const MediaSlider = ({
  text,
  media_type,
  media,
  priority = false,
}: MediaSliderProps) => {
  const slider = useRef<HTMLDivElement | null>(null);

  const [scrollDetails, setScrollDetails] = useState<{
    scrollLeft: number;
    maxScroll: number;
  }>({ scrollLeft: 0, maxScroll: 0 });

  useEffect(() => {
    setScrollDetails({
      scrollLeft: slider.current!.scrollLeft,
      maxScroll: slider.current!.scrollWidth - slider.current!.clientWidth,
    });
  }, [media]);

  return (
    <div className="relative mr-2 flex flex-col gap-4">
      <span className="text-2xl font-light md:text-3xl">{text}</span>
      <hr />
      <div
        ref={slider}
        onScroll={throttle(500, (e: UIEvent<HTMLDivElement>) => {
          setScrollDetails({
            scrollLeft: e.currentTarget.scrollLeft,
            maxScroll:
              e.currentTarget.scrollWidth - e.currentTarget.clientWidth,
          });
        })}
        className="-m-2 flex snap-x scroll-p-2 flex-row gap-6 overflow-x-auto p-2 scrollbar-hide"
      >
        {media === undefined ? (
          [...Array(10)].map((_, i) => <ShimmerThumbnail key={i} />)
        ) : typeof media === "string" ? (
          <div className="mx-auto flex h-48 flex-row items-center md:h-[237px]">
            {media}
          </div>
        ) : (
          media.map((item, i) => (
            <MediaThumbnail
              key={item.id}
              priority={priority && i === 0}
              // The default movie will be overriden by {...item} on continue watching
              media_type={media_type || "movie"}
              {...item}
            />
          ))
        )}
      </div>

      <div
        className={`${
          scrollDetails.scrollLeft === 0 ? "hidden" : "flex"
        } absolute top-4 h-full flex-col justify-center`}
      >
        <HiOutlineChevronLeft
          className="h-6 w-6 cursor-pointer"
          onClick={() =>
            slider.current?.scrollBy({ left: -900, behavior: "smooth" })
          }
        />
      </div>
      <div
        className={`${
          scrollDetails.scrollLeft === scrollDetails.maxScroll
            ? "hidden"
            : "flex"
        } absolute top-4 right-0 h-full flex-col justify-center`}
      >
        <HiOutlineChevronRight
          className="h-6 w-6 cursor-pointer"
          onClick={() =>
            slider.current?.scrollBy({ left: 900, behavior: "smooth" })
          }
        />
      </div>
    </div>
  );
};

export default MediaSlider;
