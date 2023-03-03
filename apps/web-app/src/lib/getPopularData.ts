import { prisma } from "@movies4discord/db";
import { getMovie, getTV } from "./getTmdbData";

export const getPopularMovies = async (
  page?: number
) => {
  const data = await prisma.history.groupBy({
    where: {
      percentage: {
        gte: 80
      },
      updatedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      isShow: false
    },
    by: ["tmdbId", "isShow"],
    _count: {
      tmdbId: true,
      isShow: true
    },
    orderBy: {
      _count: {
        tmdbId: "desc"
      }
    },
    take: 25,
    skip: page ? (page - 1) * 25 : 0
  });
  const movieDetails = await Promise.all(
    data.map(movie => getMovie(movie.tmdbId))
  );

  return movieDetails;
};

export const getPopularTV = async (
  page?: number
) => {
  const data = await prisma.history.groupBy({
    where: {
      percentage: {
        gte: 80
      },
      updatedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      isShow: true
    },
    by: ["tmdbId", "isShow"],
    _count: {
      tmdbId: true,
      isShow: true
    },
    orderBy: {
      _count: {
        tmdbId: "desc"
      }
    },
    take: 25,
    skip: page ? (page - 1) * 25 : 0
  });
  const tvDetails = await Promise.all(
    data.map(tv => getTV(tv.tmdbId))
  );

  return tvDetails;
}