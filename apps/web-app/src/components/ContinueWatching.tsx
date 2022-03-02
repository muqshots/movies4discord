import { fetcher } from "@/lib/fetcher";
import { GetHistory } from "@/pages/api/history";
import ky from "ky";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import MediaSlider from "./MediaSlider";

const ContinueWatching = () => {
  const { status } = useSession();

  const { data: historyJson } = useSWR<GetHistory>(
    status === "authenticated" ? `/api/history?take=20` : null,
    fetcher
  );

  const router = useRouter();

  return (
    <>
      {status !== "unauthenticated" && historyJson?.history.length !== 0 && (
        <MediaSlider
          text="Continue watching"
          media={historyJson?.history.map((item) => ({
            ...item,
            onClick: async () => {
              const key = (
                await ky
                  .post("/api/key", {
                    searchParams: {
                      media_type: item.media_type,
                      tmdbId: item.id,
                      tvdbId: item.tvdbId,
                      season: item.season,
                      episode: item.episode,
                    },
                  })
                  .json<{ key: string }>()
              ).key;
              router.push(`/${item.media_type}/${item.id}/${key}`);
            },
          }))}
        />
      )}{" "}
    </>
  );
};

export default ContinueWatching;
