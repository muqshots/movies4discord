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

    const addListeners = () => {
      if (!ref.current) return;
      const plyr = ref.current.plyr;

      plyr.on("loadedmetadata", async () => {
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
          plyr.currentTime = (percentage / 100) * plyr.duration;
        }
      });

      plyr.on(
        "progress",
        throttle(5000, () => {
          if (active && plyr.currentTime > 0)
            ky.post("/api/history", {
              searchParams: {
                ...historyParams,
                percentage: (plyr.currentTime / plyr.duration) * 100,
              },
            });
        })
      );
    };

    setTimeout(addListeners, 0);

    return () => {
      active = false;
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
