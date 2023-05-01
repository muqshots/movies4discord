import MediaThumbnail, {
  MediaThumbnailProps,
} from "@/components/MediaThumbnail";
import SelectableButton from "@/components/SelectableButton";
import SelectableCheckbox from "@/components/SelectableCheckbox";
import ShimmerThumbnail from "@/components/ShimmerThumbnail";
import { fetcher } from "@/lib/fetcher";
import { getQuery } from "@/lib/getQuery";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

const Search = () => {
  const router = useRouter();
  const query = getQuery(router.query.query)?.trim();
  const { data } = useSWR<{ results: MediaThumbnailProps[] }>(
    `/api/search?query=${query}`,
    fetcher
  );
  const [showNSFW, setShowNSFW] = useState(false);
  const [mediaType, setMediaType] = useState<"movie" | "tv" | "all">("all");
  const searchResults = data?.results;

  const filteredResults = searchResults?.filter((result) => {
    if (mediaType === "all") return true;
    return result.media_type === mediaType;
  }).filter((result) => {
    return showNSFW ? true : !result.adult;
  });


  return (
    <div className="mx-3 mb-2 flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center overflow-x-auto overflow-y-hidden">
        <div className="flex shrink-0 text-center text-2xl font-light md:text-left md:text-4xl mr-3">{`Search results for "${query}"`}</div>
        <div className="flex flex-row flex-nowrap justify-center gap-1 md:justify-start md:mr-10">
          <div className="flex ">
            <SelectableButton
              item={{
                id: 0,
                name: "All",
              }}
              selected={mediaType === "all"}
              onClick={() => setMediaType("all")}
            />
            <SelectableButton
              item={{
                id: 1,
                name: "Movies",
              }}
              selected={mediaType === "movie"}
              onClick={() => setMediaType("movie")}
            />
            <SelectableButton
              item={{
                id: 2,
                name: "TV Shows",
              }}
              selected={mediaType === "tv"}
              onClick={() => setMediaType("tv")}
            />
          </div>
          <div className="mx-2 md:mx-0 border-gray-300 w-0.5 hidden md:block"></div>
          <div className="flex flex-row gap-1">
            <SelectableCheckbox
              item={{
                id: 0,
                name: "NSFW",
              }}
              selected={showNSFW}
              onClick={() => setShowNSFW(!showNSFW)}
            />
          </div>
        </div>
      </div>
      <hr className="md:mr-8" />
      <div className="flex flex-row flex-wrap justify-center gap-5 md:justify-start">
        {!filteredResults ? (
          [...Array(10)].map((_, i) => <ShimmerThumbnail key={i} />)
        ) : filteredResults.length > 0 ? (
          filteredResults.map((r) => (
            <MediaThumbnail key={r.media_type + r.id} {...r} />
          ))
        ) : (
          <div className="text-center">No results</div>
        )}
      </div>
    </div>
  );
};

export default Search;
