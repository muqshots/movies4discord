import MediaThumbnail from "@/components/MediaThumbnail";
import ShimmerThumbnail from "@/components/ShimmerThumbnail";
import { fetcher } from "@/lib/fetcher";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { GetHistory } from "./api/history";

const Watchlist = () => {
  const { status } = useSession();
  const { data: historyJson, mutate } = useSWR<GetHistory>(
    status === "authenticated" ? `/api/history?gte=0&lte=100` : null,
    fetcher
  );
  const history = historyJson?.history;

  return (
    <div className="mx-3 mb-2 flex flex-col gap-4">
      <div className="text-center text-2xl font-light md:text-left md:text-4xl">
        History
      </div>
      <hr className="md:mr-8" />
      <div className="flex flex-row flex-wrap justify-center gap-5 md:justify-start">
        {status === "unauthenticated" ? (
          <div className="text-center">Please login to view your history</div>
        ) : !history ? (
          [...Array(10)].map((_, i) => <ShimmerThumbnail key={i} />)
        ) : history.length > 0 ? (
          history?.map((r) => (
            <MediaThumbnail key={r.media_type + r.id} onDelete={mutate} {...r} />
          ))
        ) : (
          <div className="text-center">You have nothing here :(</div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
