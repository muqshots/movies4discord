import MediaThumbnail, {
  MediaThumbnailProps,
} from "@/components/MediaThumbnail";
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
  return (
    <div className="mr-2 flex flex-col gap-4">
      <span className="text-2xl font-light md:text-3xl">{text}</span>
      <hr />
      <div className="-m-2 flex snap-x scroll-p-2 flex-row gap-6 overflow-x-auto p-2 scrollbar-hide">
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
    </div>
  );
};

export default MediaSlider;
