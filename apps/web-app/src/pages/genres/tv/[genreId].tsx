import GenrePage from "@/components/GenrePage";
import { formatTVForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getTVSByGenre } from "@/lib/getTmdbData";
import { isProd } from "@/lib/isProd";
import { tvGenres } from "@/lib/tmdbGenres";
import InferNextProps from "infer-next-props-type";
import { GetStaticPropsContext } from "next";

const TVGenresPage = ({
  media,
  selectedGenre,
}: InferNextProps<typeof getStaticProps>) => {
  return (
    <GenrePage
      genres={tvGenres}
      selectedGenre={selectedGenre}
      text="Browse TV"
      media_type="tv"
      media={media}
    />
  );
};

export default TVGenresPage;

export const getStaticPaths = async () => {
  return {
    paths: tvGenres.map((g) => ({ params: { genreId: g.id.toString() } })),
    fallback: false,
  };
};

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const doPlaceholders = isProd;
  const defaultGenre = tvGenres[0]!;

  const genreId = (params?.genreId as string | undefined) ?? defaultGenre.id;
  const genreName = tvGenres.find((g) => g.id == genreId)?.name;

  if (!genreName) {
    return {
      notFound: true,
    };
  }

  const tvs = await Promise.all(
    (
      await getTVSByGenre(genreId)
    ).map((t) => formatTVForThumbnail(t, doPlaceholders))
  );

  return {
    props: {
      media: tvs,
      selectedGenre: genreName,
    },
    revalidate: 86400, // Revalidate every day
  };
};
