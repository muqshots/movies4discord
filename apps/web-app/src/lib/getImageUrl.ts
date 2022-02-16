// Get tmdb url from fp or null

export const getImageUrl = (fp: string | null, size = "original") => {
  return fp ? `https://image.tmdb.org/t/p/${size}${fp}` : null;
};
