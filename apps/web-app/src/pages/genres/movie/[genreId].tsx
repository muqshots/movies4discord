import GenrePage from "@/components/GenrePage";
import { formatMovieForThumbnail } from "@/lib/formatMediaForThumbnail";
import { getMoviesByGenre } from "@/lib/getTmdbData";
import { isProd } from "@/lib/isProd";
import { movieGenres } from "@/lib/tmdbGenres";
import InferNextProps from "infer-next-props-type";
import { GetStaticPropsContext } from "next";

const MovieGenresPage = ({
  media,
  selectedGenre,
}: InferNextProps<typeof getStaticProps>) => {
  return (
    <GenrePage
      genres={movieGenres}
      selectedGenre={selectedGenre}
      text="Browse Movies"
      media_type="movie"
      media={media}
    />
  );
};

export default MovieGenresPage;

export const getStaticPaths = async () => {
  return {
    paths: movieGenres.map((g) => ({ params: { genreId: g.id.toString() } })),
    fallback: false,
  };
};

export const getStaticProps = async ({ params }: GetStaticPropsContext) => {
  const doPlaceholders = isProd;
  const defaultGenre = movieGenres[0]!;

  const genreId = (params?.genreId as string | undefined) ?? defaultGenre.id;
  const genreName = movieGenres.find((g) => g.id == genreId)?.name;

  if (!genreName) {
    return {
      notFound: true,
    };
  }

  const movies = await Promise.all(
    (
      await getMoviesByGenre(genreId)
    ).map((m) => formatMovieForThumbnail(m, doPlaceholders))
  );

  return {
    props: {
      media: movies,
      selectedGenre: genreName,
    },
    revalidate: 86400, // Revalidate every day
  };
};
