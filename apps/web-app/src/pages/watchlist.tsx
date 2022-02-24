import MediaThumbnail, {
  MediaThumbnailProps,
} from "@/components/MediaThumbnail";
import ShimmerThumbnail from "@/components/ShimmerThumbnail";
import { fetcher } from "@/lib/fetcher";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const Watchlist = () => {
  const { status } = useSession();
  const { data: watchlist } = useSWR<MediaThumbnailProps[]>(
    `/api/watchlist`,
    fetcher
  );

  return (
    <div className="mx-3 mb-2 flex flex-col gap-4">
      <div className="text-center text-2xl font-light md:text-left md:text-4xl">
        Watchlist
      </div>
      <hr className="md:mr-8" />
      <div className="flex flex-row flex-wrap justify-center gap-5 md:justify-start">
        {status === "unauthenticated" ? (
          <div className="text-center">Please login to view your watchlist</div>
        ) : !watchlist ? (
          [...Array(10)].map((_, i) => <ShimmerThumbnail key={i} />)
        ) : watchlist.length > 0 ? (
          watchlist.map((r) => (
            <MediaThumbnail key={r.media_type + r.id} {...r} />
          ))
        ) : (
          <div className="text-center">You have nothing here :(</div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
