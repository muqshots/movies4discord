import GenreButton from "@/components/GenreButton";
import MediaThumbnail, {
  MediaThumbnailProps,
} from "@/components/MediaThumbnail";
import { Genre } from "@movies4discord/interfaces";

interface GenrePageProps {
  genres: Genre[];
  selectedGenre: string;
  text: string;
  media_type: "movie" | "tv";
  media: Omit<MediaThumbnailProps, "media_type">[];
}

const GenrePage = ({
  genres,
  selectedGenre,
  text,
  media_type,
  media,
}: GenrePageProps) => {
  return (
    <div className="mx-3 flex flex-col gap-4">
      <div className="text-center text-2xl font-light md:text-left md:text-4xl">
        {text}
      </div>
      <div className="flex flex-row flex-wrap justify-center gap-1 md:justify-start">
        {genres.map((genre) => (
          <GenreButton
            key={genre.id}
            genre={genre}
            media_type={media_type}
            selected={selectedGenre === genre.name}
          />
        ))}
      </div>
      <hr className="md:mr-8" />
      <div className="flex flex-row flex-wrap justify-center gap-5 md:justify-start">
        {media.map((m) => (
          <MediaThumbnail key={m.id} media_type={media_type} {...m} />
        ))}
      </div>
    </div>
  );
};

export default GenrePage;
