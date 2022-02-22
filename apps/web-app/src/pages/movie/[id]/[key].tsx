import InferNextProps from "infer-next-props-type";
import { GetServerSidePropsContext } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "@movies4discord/db";
import { isProd } from "@/lib/isProd";
import { useEffect, useRef, useState } from "react";
import Plyr from "plyr-react";
import "plyr-react/dist/plyr.css";
import { throttle } from "throttle-debounce";
import { getMovie } from "@/lib/getTmdbData";
import { getImageUrl } from "@/lib/getImageUrl";
import ky from "ky";

const StreamMovie = ({
  defaultServer,
  viewKey,
  title,
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

  const ref = useRef<{ plyr: Plyr }>(null);

  useEffect(() => {
    const handleError = () => alert("ERROR");

    const video = document.getElementsByTagName("source")[0]!;
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const addListeners = () => {
      if (!ref.current) return;
      const plyr = ref.current.plyr;

      plyr.on(
        "progress",
        throttle(5000, () => {
          if (active)
            ky("https://flash.siwalik.in/delay/5000", {
              searchParams: { timeStamp: plyr.currentTime },
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

  const [streamUrl, setStreamUrl] = useState(
    isProd
      ? getStreamUrl()
      : "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4"
  );

  return (
    <div className="flex flex-row items-center justify-center">
      <div className="aspect-square w-4/5">
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
                src: `/api/subtitles?t=movie&q=${title}&language=en`,
                label: "English",
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext<{ id: string; key: string }>) => {
  const jwt = await getToken({
    req: req,
    secret: process.env.AUTH_SECRET!,
  });

  if (!jwt) {
    return {
      redirect: {
        destination: "/",
        statusCode: 401,
      },
    };
  }

  const { id, key } = params!;

  const user = await prisma.user.findUnique({ where: { id: jwt.userID } });

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
      title: movieData.title,
      backdropUrl: getImageUrl(movieData.backdrop_path),
    },
  };
};

export default StreamMovie;
