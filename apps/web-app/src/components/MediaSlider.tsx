import MediaThumbnail, {
  MediaThumbnailProps,
} from "@/components/MediaThumbnail";

export interface MediaSliderProps {
  text: string;
  media_type: "movie" | "tv";
  media: Omit<MediaThumbnailProps, "media_type">[];
}

const MediaSlider = ({ text, media_type, media }: MediaSliderProps) => {
  return (
    <div className="mr-2 flex flex-col gap-4">
      <span className="text-2xl font-light md:text-3xl">{text}</span>
      <hr />
      <div className="scrollbar-hide -m-2 flex snap-x scroll-p-2 gap-6 overflow-x-auto p-2">
        {media.map((item) => (
          <MediaThumbnail key={item.id} media_type={media_type} {...item} />
        ))}
      </div>
    </div>
  );
};

export default MediaSlider;
