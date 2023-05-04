import { Stream } from "@/components/Stream";
import { getImageUrl } from "@/lib/getImageUrl";
import { servers } from "@/lib/getServers";
import { getMovie } from "@/lib/getTmdbData";
import { prisma, Server } from "@movies4discord/db";
import InferNextProps from "infer-next-props-type";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { NextSeo } from "next-seo";

const StreamMovie = ({
  defaultServer,
  viewKey,
  id,
  title,
  overview,
  year,
  backdropUrl,
  servers,
}: InferNextProps<typeof getServerSideProps>) => {
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

      <Stream
        servers={servers}
        defaultServer={defaultServer}
        viewKey={viewKey}
        backdropUrl={backdropUrl}
        title={title}
        historyParams={{
          tmdbId: id,
          media_type: "movie",
        }}
        subs={[
          {
            kind: "subtitles",
            srcLang: "en",
            src: `/api/subtitles?t=movie&&q=${title}&language=en${
              year ? `&year=${year}` : ""
            }`,
            label: "English",
          },
        ]}
      />
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
        destination: "/"
      },
    };
  }

  const { id, key } = params!;

  const user = await prisma.user.findUnique({ where: { id: session.userID } });

  if (!user) {
    return {
      redirect: {
        destination: "/api/auth/signin"
      },
    };
  }

  const [movieData, keyData] = await Promise.all([
    getMovie(id),
    prisma.viewkey.findUnique({
      where: { key },
      select: { tmvdbId: true },
    }),
  ]);

  if (!keyData) {
    return {
      redirect: {
        destination: `/movie/${id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      defaultServer: user.server,
      viewKey: key,
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      year: movieData.release_date?.slice(0, 4),
      backdropUrl: getImageUrl(movieData.backdrop_path),
      servers: servers,
    },
  };
};

export default StreamMovie;
