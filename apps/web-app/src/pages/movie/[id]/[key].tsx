import { getImageUrl } from "@/lib/getImageUrl";
import { getMovie } from "@/lib/getTmdbData";
import { isProd } from "@/lib/isProd";
import { prisma } from "@movies4discord/db";
import InferNextProps from "infer-next-props-type";
import ky from "ky";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import Plyr from "plyr-react";
import "plyr-react/dist/plyr.css";
import { useEffect, useRef, useState } from "react";
import { throttle } from "throttle-debounce";

const StreamMovie = ({
  defaultServer,
  viewKey,
  id,
  title,
  overview,
  year,
  backdropUrl,
}: InferNextProps<typeof getServerSideProps>) => {
  const getStreamUrl = (server: string = defaultServer) => {
    return (
      (!isProd || process.env.NEXT_PUBLIC_TESTING === "yes"
        ? `http://localhost:6969`
        : `https://${server.toLowerCase()}.movies4discord.xyz`) +
      `?viewkey=${viewKey}`
    );
  };

  const [streamUrl, setStreamUrl] = useState(
    isProd
      ? getStreamUrl()
      : "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4"
  );

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

      plyr.on(
        "progress",
        throttle(5000, () => {
          if (active && plyr.currentTime > 0)
            ky.post("/api/history", {
              searchParams: {
                tmdbId: id,
                media_type: "movie",
                percentage: (plyr.currentTime / plyr.duration) * 100,
              },
            });
        })
      );
    };

    setTimeout(addListeners, 0);

    return () => {
      console.log("Inactive");
      active = false;
    };
  });

  return (
    <>
      <NextSeo
        title={`Streaming ${title}`}
        description={overview || "No Description Available."}
        openGraph={{
          images: [
            {
              url: backdropUrl ?? "https://http.cat/404",
              type: "image/jpeg",
              alt: `${title} backdrop`,
            },
          ],
        }}
      />

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
              tracks: [
                {
                  kind: "subtitles",
                  srcLang: "en",
                  src: `/api/subtitles?t=movie&q=${title}&language=en${
                    year ? `&year=${year}` : ""
                  }`,
                  label: "English",
                },
              ],
            }}
          />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext<{ id: string; key: string }>) => {
  const session = await getSession({ req: req });

  if (!session) {
    return {
      redirect: {
        destination: "/",
        statusCode: 401,
      },
    };
  }

  const { id, key } = params!;

  const user = await prisma.user.findUnique({ where: { id: session.userID } });

  if (!user) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        statusCode: 401,
      },
    };
  }

  const movieData = await getMovie(id);

  return {
    props: {
      defaultServer: user.server,
      viewKey: key,
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      year: movieData.release_date?.slice(0, 4),
      backdropUrl: getImageUrl(movieData.backdrop_path),
    },
  };
};

export default StreamMovie;
