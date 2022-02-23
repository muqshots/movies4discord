import MediaThumbnail, {
  MediaThumbnailProps,
} from "@/components/MediaThumbnail";
import ShimmerThumbnail from "./ShimmerThumbnail";

interface MediaSliderWithItems {
  text: string;
  media_type: "movie" | "tv";
  media: Omit<MediaThumbnailProps, "media_type">[];
}

interface ContinueWatchingSlider {
  text: string;
  media?: MediaThumbnailProps[];

  media_type?: never;
}

export type MediaSliderProps = ContinueWatchingSlider | MediaSliderWithItems;

const MediaSlider = ({ text, media_type, media }: MediaSliderProps) => {
  return (
    <div className="mr-2 flex flex-col gap-4">
      <span className="text-2xl font-light md:text-3xl">{text}</span>
      <hr />
      <div className="scrollbar-hide -m-2 flex snap-x scroll-p-2 gap-6 overflow-x-auto p-2">
        {media
          ? media.map((item) => (
              <MediaThumbnail
                key={item.id}
                // The default movie will be overriden by {...item} on continue watching
                media_type={media_type || "movie"}
                {...item}
              />
            ))
          : [...Array(8)].map((_, i) => <ShimmerThumbnail key={i} />)}
      </div>
    </div>
  );
};

export default MediaSlider;
