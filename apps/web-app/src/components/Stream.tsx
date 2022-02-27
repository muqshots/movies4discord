import { getStreamUrl } from "@/lib/getStreamUrl";
import { Server } from "@movies4discord/db";
import ky from "ky";
import { useRouter } from "next/router";
import Plyr from "plyr-react";
import "plyr-react/dist/plyr.css";
import { useEffect, useRef, useState } from "react";
import { throttle } from "throttle-debounce";

interface StreamProps {
  server: Server;
  viewKey: string;
  historyParams:
    | {
        tmdbId: number;
        media_type: "movie";
      }
    | {
        tmdbId: number;
        media_type: "tv";
        tvdbId: number;
        season: number;
        episode: number;
      };
  title: string;
  backdropUrl: string | null;
  subs: Plyr.Track[];
}

export const Stream = ({
  server,
  viewKey,
  historyParams,
  title,
  backdropUrl,
  subs,
}: StreamProps) => {
  const [streamUrl, setStreamUrl] = useState(getStreamUrl(server, viewKey));

  const router = useRouter();
  const ref = useRef<{ plyr: Plyr }>(null);

  useEffect(() => {
    const handleError = () =>
      router.push(`/videoerror?source=${encodeURIComponent(streamUrl)}`);

    const video = document.getElementsByTagName("source")[0]!;
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("error", handleError);
    };
  }, [router, streamUrl]);

  useEffect(() => {
    let active = true;

    async function handleLoad(e: Plyr.PlyrEvent) {
      if (!active) return;
      const percentage = (
        await ky
          .get(`/api/history`, {
            searchParams: {
              ...historyParams,
              one: true,
            },
          })
          .json<{ percentage: number | null }>()
      ).percentage;
      if (percentage) {
        e.detail.plyr.currentTime = (percentage / 100) * e.detail.plyr.duration;
      }
    }

    const handleProgress = throttle(5000, async (e: Plyr.PlyrEvent) => {
      if (active && e.detail.plyr.currentTime > 0) {
        await ky.post("/api/history", {
          searchParams: {
            ...historyParams,
            percentage:
              (e.detail.plyr.currentTime / e.detail.plyr.duration) * 100,
          },
        });
      }
    });

    const addListeners = () => {
      if (!ref.current) return;
      const plyr = ref.current.plyr;

      plyr.on("loadedmetadata", handleLoad);
      plyr.on("progress", handleProgress);
    };

    const removeListeners = () => {
      if (!ref.current) return;
      const plyr = ref.current.plyr;
      plyr.off("loadedmetadata", handleLoad);
      plyr.off("progress", handleProgress);
    };

    setTimeout(addListeners, 0);

    return () => {
      active = false;
      removeListeners();
    };
  });

  return (
    <>
      <div className="flex flex-row items-center justify-center">
        <div className="w-4/5">
          <Plyr
            ref={ref}
            options={{
              ratio: "16:9",
              storage: { enabled: true, key: "m4d" },
              controls: [
                "play-large",
                "play",
                "progress",
                "current-time",
                "mute",
                "volume",
                "captions",
                "settings",
                "pip",
                "download",
                "airplay",
                "fullscreen",
              ],
            }}
            source={{
              type: "video",
              title: title,
              poster: backdropUrl ?? undefined,
              sources: [
                {
                  src: streamUrl,
                  type: "video/mp4",
                  provider: "html5",
                },
              ],
              tracks: subs,
            }}
          />
        </div>
      </div>
    </>
  );
};
