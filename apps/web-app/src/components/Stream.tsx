import { getStreamUrl } from "@/lib/getStreamUrl";
import { Server } from "@movies4discord/db";
import ky from "ky";
import { useRouter } from "next/router";
import Plyr from "plyr-react";
import "plyr-react/dist/plyr.css";
import { useEffect, useRef, useState } from "react";
import { throttle, debounce } from "throttle-debounce";
import ServerChip from "./ServerChip";

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
  const [hide, setHide] = useState(true);
  const [offset, setOffset] = useState(0);

  const streamUrl = getStreamUrl(server, viewKey);

  let mediaObj: any = {};

  const router = useRouter();
  const ref = useRef<{ plyr: Plyr }>(null);

  useEffect(() => {
    const handleError = async () => {
      const videoParent = video.parentElement as HTMLVideoElement;
      if (videoParent.networkState === 3) {
        const videoPage = await ky.get(streamUrl, { throwHttpErrors: false });
        if (videoPage.status !== 404) {
          const responseText = await videoPage.text();
          router.push(`/videoerror?mediaPage=/${historyParams.media_type}/${historyParams.tmdbId}&errorText=${responseText}&mediaTitle=${title}${historyParams.media_type === "tv" ? "&season=" + historyParams.season + "&episode=" + historyParams.episode : null}&server=${server}`);
          return;
        }
        const key = (
          await ky
            .post("/api/key", {
              searchParams: { ...historyParams },
            })
            .json<{ key: string }>()
        ).key;

        router.push(`/${historyParams.media_type}/${historyParams.tmdbId}/${key}`);
      } else {
        router.push(`/videoerror?source=&errorText=Network State: ${videoParent.networkState}`);
      }
    };

    const video = document.getElementsByTagName("source")[0]!;
    video.addEventListener("error", handleError);

    return () => video.removeEventListener("error", handleError);
  }, [router, streamUrl, historyParams]);

  useEffect(() => {
    let active = true;

    async function handleLoad(e: Plyr.PlyrEvent) {
      if (!active) return;
      const plyr = e.detail.plyr;

      // Temporary fix until plyr quits being shit or I switch to vidstack
      const downloadLink = document.querySelectorAll('[data-plyr="download"]');
      downloadLink[0]?.setAttribute("href", streamUrl);

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
      const video = document.querySelector("video") as HTMLVideoElementWithTracks;

      if (video && video.audioTracks != null && video.audioTracks.length > 0) {
        if (navigator.userAgent.toLowerCase().indexOf("android") > -1) return;
        const audioTracks = Array.from(video.audioTracks);
        const engTracks = audioTracks.filter((track) => track.language.startsWith("en"));

        if (engTracks && engTracks.length > 0) {
          if (engTracks.some((track) => track.enabled)) return;
          const engStereoTrack = engTracks.find((track) => track.label.match(/stereo|5\.1/gi));
          const engTrack = engStereoTrack || engTracks[0];
          engTrack!.enabled = true;
          const otherTracks = audioTracks.filter((track) => track !== engTrack);
          otherTracks.forEach((track) => (track.enabled = false));
        }
        // Video sometimes stopped after changing track until moved but this seems to reliably fix it
        video.currentTime = video.currentTime - 0.01;
        video.play();
      }

      if (historyParams.media_type === "tv") {
        const mediaRes: any = await ky
          .get(`/api/trakt?mode=search&tmdbId=${historyParams.tmdbId}`)
          .json();

        const episodeRes: any = await ky
          .get(`/api/trakt?mode=episode&showId=${mediaRes[0].show.ids.trakt}&season=${historyParams.season}&episode=${historyParams.episode}`)
          .json();

        mediaObj = {
          episode: {
            ids: {
              trakt: episodeRes.ids.trakt,
            },
          },
          progress: (plyr.currentTime / plyr.duration) * 100,
        };
      } else {
        mediaObj = {
          movie: {
            ids: {
              tmdb: historyParams.tmdbId,
            },
          },
          progress: (plyr.currentTime / plyr.duration) * 100,
        };
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
        if (mediaObj) {
          if (
            (e.detail.plyr?.currentTime / e.detail.plyr?.duration) * 100 >
            90
          ) {
            await ky
              .post("/api/trakt", {
                json: {
                  mode: "scrobble/stop",
                  mediaType: historyParams.media_type,
                  tmdbId: historyParams.tmdbId,
                  episodeId:
                    historyParams.media_type === "tv"
                      ? mediaObj.episode.ids.trakt
                      : null,
                  progress:
                    (e.detail.plyr?.currentTime / e.detail.plyr?.duration) *
                    100,
                },
              })
              .catch(e => console.log(e));
          }
        }
        if (e.detail.plyr.currentTime >= e.detail.plyr.duration - 0.01 && historyParams.media_type === "tv") {
          const nextEpisode = (
            await ky
              .get(`/api/nextepisode`, {
                searchParams: {
                  ...historyParams,
                  one: true,
                },
              })
              .json<{ nextEpisode: number | null }>()
          ).nextEpisode;
          if (nextEpisode) {
            const key = (
              await ky
                .post("/api/key", {
                  searchParams: {
                    ...historyParams,
                    episode: nextEpisode,
                  },
                })
                .json<{ key: string }>()
            ).key;
            router.push(
              `/${historyParams.media_type}/${historyParams.tmdbId}/${key}`
            );
          }
        }
      }
    });

    const addListeners = () => {
      if (!ref.current) return;
      const plyr = ref.current.plyr;

      plyr?.on("loadedmetadata", handleLoad);
      plyr?.on("progress", handleProgress);
      plyr?.on(
        "play",
        debounce(250, async () => {
          await ky
            .post("/api/trakt", {
              json: {
                mode: "scrobble/start",
                tmdbId: historyParams.tmdbId,
                mediaType: historyParams.media_type,
                episodeId:
                  historyParams.media_type === "tv"
                    ? mediaObj!.episode?.ids.trakt
                    : null,
                progress: (plyr.currentTime / plyr.duration) * 100,
              },
            })
            .catch(e => console.log(e));
        })
      );
      plyr?.on("pause", async () => {
        const progress = (plyr?.currentTime / plyr?.duration) * 100;
        if (progress < 90) {
          await ky
            .post("/api/trakt", {
              json: {
                mode: "scrobble/pause",
                tmdbId: historyParams.tmdbId,
                mediaType: historyParams.media_type,
                episodeId:
                  historyParams.media_type === "tv"
                    ? mediaObj!.episode?.ids.trakt
                    : null,
                progress: progress,
              },
            })
            .catch(e => console.log(e));
        }
      });
    };

    const removeListeners = () => {
      if (!ref.current) return;
      const plyr = ref.current.plyr;
      plyr.off("loadedmetadata", handleLoad);
      plyr.off("progress", handleProgress);

      if (mediaObj) {
        ky.post("/api/trakt", {
          json: {
            mode: "scrobble/stop",
            mediaType: historyParams.media_type,
            tmdbId: historyParams.tmdbId,
            episodeId:
              historyParams.media_type === "tv"
                ? mediaObj.episode?.ids.trakt
                : null,
            progress:
              (plyr?.currentTime / plyr?.duration) * 100,
          },
        })
          .catch(e => console.log(e));
      }
    };

    setTimeout(addListeners, 10);

    return () => {
      active = false;
      removeListeners();
    };
  });

  return (
    <>
      <div className="ml-5 flex flex-col items-center justify-center">
        <div className="mt-1 items-start text-xl font-bold">
          Streaming {title} on {server} server
        </div>
        {historyParams.media_type === "tv" && (
          <div>
            <div className="flex items-center">
              <div className="text-xl">Season {historyParams.season} Episode {historyParams.episode}</div>
            </div>
          </div>
        )}
        <div className="my-3 flex flex-row gap-2">
          {servers.map((s) => ServerChip(s, setServer))}
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
              },
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
        <div className="mt-5 flex w-full flex-col items-center justify-center text-black">
          <button
            className="flex flex-row items-center gap-1 rounded-md bg-blue-500 py-2 px-4 text-white transition duration-200 hover:bg-white hover:text-black"
            onClick={() => {
              setHide(!hide);
            }}
          >
            <div className="text-sm">{hide ? "Open Sync" : "Close Sync"}</div>
          </button>

        </div>
        <div
          className={`mt-3 mb-5 flex w-auto flex-col items-center justify-center rounded-xl bg-gray-800 text-black ${hide ? "hidden" : "transition-all duration-200"}`}
        >
          <p className="mb-10 mt-5 flex flex-row text-xl text-white">
            Sync subtitles:
          </p>
          <p className="wrap mb-10 ml-5 mr-5 flex flex-row text-center text-xl text-white">
            To sync subtitles, either enter a positive number or a negative
            number.
            <br /> Syncing is done by milliseconds.
            <br /> A positive duration will make subtitles faster.
            <br /> A negative duration will make subtitles slower.
            <br /> Dont close the menu after syncing, it wont work.
            <br /> 1 second = 1000 miliseconds
          </p>
          <input
            type={"number"}
            className="mx-3 mb-5 flex flex-row items-center justify-center gap-8 rounded-lg"
            placeholder="1 second = 1000 ms"
            onChange={debounce(500, (e) => {
              if (e.target.value.length > 0) {
                const newOffset = parseInt(e.target.value) / 1000;
                const video = document.getElementsByTagName("video")[0];
                if (video) {
                  Array.from(video.textTracks).forEach((track) => {
                    Array.from(track.cues || []).forEach((cue) => {
                      cue.startTime = cue.startTime + newOffset;
                      cue.endTime = cue.endTime + newOffset;
                    });
                  });
                  setOffset(newOffset);
                }
              } else {
                const video = document.getElementsByTagName("video")[0];
                if (video) {
                  Array.from(video.textTracks).forEach((track) => {
                    Array.from(track.cues || []).forEach((cue) => {
                      cue.startTime = cue.startTime - offset;
                      cue.endTime = cue.endTime - offset;
                    });
                  });
                }
              }
            })}
          />
          
          <p className="text-white">Offset: {offset} seconds</p>
          <input
            type="range"
            className="mx-3 mb-5 flex flex-row items-center justify-center gap-8 rounded-lg w-9/12"
            min="-7500"
            max="7500"
            step="500" 
            onChange={debounce(500, (e) => {
              if (e.target.value.length > 0) {
                const newOffset = parseInt(e.target.value) / 1000;
                const video = document.getElementsByTagName("video")[0];
                if (video) {
                  Array.from(video.textTracks).forEach((track) => {
                    Array.from(track.cues || []).forEach((cue) => {
                      cue.startTime = cue.startTime + newOffset;
                      cue.endTime = cue.endTime + newOffset;
                    });
                  });
                  setOffset(newOffset);
                }
              } else {
                const video = document.getElementsByTagName("video")[0];
                if (video) {
                  Array.from(video.textTracks).forEach((track) => {
                    Array.from(track.cues || []).forEach((cue) => {
                      cue.startTime = cue.startTime - offset;
                      cue.endTime = cue.endTime - offset;
                    });
                  });
                }
              }
            })}
          />
        </div>
      </div>
    </>
  );
};
