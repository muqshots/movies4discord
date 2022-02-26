import { Stream } from "@/components/Stream";
import { getImageUrl } from "@/lib/getImageUrl";
import { getTV } from "@/lib/getTmdbData";
import { prisma } from "@movies4discord/db";
import InferNextProps from "infer-next-props-type";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import "plyr-react/dist/plyr.css";

const StreamTV = ({
  defaultServer,
  viewKey,
  id,
  title,
  overview,
  year,
  backdropUrl,

  tvdbId,
  season,
  episode,
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
        server={defaultServer}
        viewKey={viewKey}
        backdropUrl={backdropUrl}
        title={title}
        historyParams={{
          tvdbId,
          season,
          episode,
          media_type: "tv",
        }}
        subs={[
          {
            kind: "subtitles",
            srcLang: "en",
            src: `/api/subtitles?t=tv&season=${season}&episode=${episode}&q=${title}&language=en${
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

  const [TVData, keyData] = await Promise.all([
    getTV(id),
    prisma.viewkey.findUnique({
      where: { key },
      select: { tmvdbId: true, season: true, episode: true },
    }),
  ]);

  if (!keyData) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      defaultServer: user.server,
      viewKey: key,
      id: TVData.id,
      title: TVData.name,
      overview: TVData.overview,
      year: TVData.first_air_date?.slice(0, 4),
      backdropUrl: getImageUrl(TVData.backdrop_path),

      tvdbId: keyData.tmvdbId,
      season: keyData.season,
      episode: keyData.episode,
    },
  };
};

export default StreamTV;
