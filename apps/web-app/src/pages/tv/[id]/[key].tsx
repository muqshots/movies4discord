import MediaSlider from "@/components/MediaSlider";
import { Stream } from "@/components/Stream";
import { formatEpisodeforThumbnail } from "@/lib/formatMediaForThumbnail";
import { getImageUrl } from "@/lib/getImageUrl";
import { servers } from "@/lib/getServers";
import { getSkyhookTV } from "@/lib/getSkyhookData";
import { getTV } from "@/lib/getTmdbData";
import { isProd } from "@/lib/isProd";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@movies4discord/db";
import ky from "ky";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";

const StreamTV = ({
  defaultServer,
  servers,
  viewKey,
  id,
  title,
  overview,
  year,
  backdropUrl,

  tvdbId,
  season,
  episode,
  media,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

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
          tvdbId,
          tmdbId: id,
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
      { media &&
        <div className="mx-3 flex flex-col gap-8">
          <MediaSlider
            text="Episodes"
            media_type="tv"
            media={media.map((item) => ({
              ...item,
              onClick: async () => {
                const key = (
                  await ky
                    .post("/api/key", {
                      searchParams: {
                        media_type: "tv",
                        tmdbId: id,
                        tvdbId: tvdbId,
                        season: item.season ?? 1,
                        episode: item.episode ?? 1,
                      },
                    })
                    .json<{ key: string }>()
                ).key;
                router.push(`/tv/${id}/${key}`);
              }
            }))}
            />
        </div>
      }
    </>
  );
};

export const getServerSideProps = async ({
  req,
  res,
  params,
}: GetServerSidePropsContext<{ id: string; key: string }>) => {
  const session = await getServerSession(req, res, authOptions);
  const doPlaceholders = isProd;

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
        destination: `/tv/${id}`,
        permanent: false,
      },
    };
  }

  const media = await Promise.all(
    (await getSkyhookTV(TVData.external_ids.tvdb_id || 0))
      .episodes
      .filter(e => e.seasonNumber === keyData.season)
      .map(async (episode) => formatEpisodeforThumbnail(TVData.id, episode, doPlaceholders))
  );

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
      servers: servers,
      media: media,
    },
  };
};

export default StreamTV;
