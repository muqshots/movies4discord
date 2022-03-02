import MediaThumbnail, {
  MediaThumbnailProps,
} from "@/components/MediaThumbnail";
import ShimmerThumbnail from "@/components/ShimmerThumbnail";
import { fetcher } from "@/lib/fetcher";
import { getQuery } from "@/lib/getQuery";
import { useRouter } from "next/router";
import useSWR from "swr";

const Search = () => {
  const router = useRouter();
  const query = getQuery(router.query.query)?.trim();
  const { data } = useSWR<{ results: MediaThumbnailProps[] }>(
    `/api/search/multi?query=${query}`,
    fetcher
  );
  const searchResults = data?.results;

  return (
    <div className="mx-3 mb-2 flex flex-col gap-4">
      <div className="text-center text-2xl font-light md:text-left md:text-4xl">
        {`Search results for "${query}"`}
      </div>
      <hr className="md:mr-8" />
      <div className="flex flex-row flex-wrap justify-center gap-5 md:justify-start">
        {!searchResults ? (
          [...Array(10)].map((_, i) => <ShimmerThumbnail key={i} />)
        ) : searchResults.length > 0 ? (
          searchResults.map((r) => (
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
