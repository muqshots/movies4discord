import { getStreamUrl } from "@/lib/getStreamUrl";
import { Server } from "@movies4discord/db";
import ky from "ky";
import { useRouter } from "next/router";
import Plyr from "plyr-react";
import "plyr-react/dist/plyr.css";
import { useEffect, useRef, useState } from "react";
import { throttle } from "throttle-debounce";

interface StreamProps {
  servers: Server[];
  defaultServer: Server;
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

interface HTMLVideoElementWithTracks extends HTMLVideoElement {
  audioTracks: AudioTrack[];
}

interface AudioTrack {
  enabled: boolean;
  id: string;
  kind: string;
  label: string;
  language: string;
}

export const Stream = ({
  defaultServer,
  viewKey,
  historyParams,
  title,
  backdropUrl,
  subs,
  servers,
}: StreamProps) => {
  const [server, setServer] = useState<Server>(defaultServer);

  const streamUrl = getStreamUrl(server, viewKey);

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
      const video = (document.querySelector('video')) as HTMLVideoElementWithTracks;
      if (video && video.audioTracks != null) {
        const audioTracks = Array.from(video.audioTracks);
        const engTracks = audioTracks.filter(track => track.language === "eng");
        if (engTracks && engTracks.length > 0) {
          const engStereoTrack = engTracks.find(track => track.label === "Stereo");
          const engTrack = engStereoTrack || engTracks[0];
          // @ts-ignore
          engTrack.enabled = true;
          const otherTracks = audioTracks.filter((track) => track !== engTrack);
          otherTracks.forEach((track) => track.enabled = false);
        }
        // Video sometimes stopped after changing track until moved but this seems to reliably fix it
        video.currentTime = video.currentTime - 0.01
        video.play()
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
      <div className="ml-5 flex flex-col justify-center items-center">
        <div className="items-start text-xl font-bold mt-5">
          Streaming {title} on {server} server
        </div>
        {historyParams.media_type === "tv" && (
          <div>
            <div className="flex items-center">
              <div className="text-xl">Season {historyParams.season} Episode {historyParams.episode}</div>
            </div>
          </div>
        )}
        <div className="flex flex-row gap-2 m-4">
          {servers.map((s) => (
            <div
              key={s}
              className="rounded-lg border border-white px-3 py-1.5 hover:bg-white hover:text-black"
              onClick={() => {
                setServer(s);
                ky.post(`/api/server?server=${s}`);
              }}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="w-4/5">
          <Plyr
            ref={ref}
            options={{
              ratio: "16:9",
              storage: { enabled: true, key: "m4d" },
              controls: [
                "play-large",
                "rewind",
                "play",
                "fast-forward",
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
              fullscreen: {
                iosNative: true,
              }
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
