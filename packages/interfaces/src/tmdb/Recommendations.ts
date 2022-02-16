import { Movie, TMDBListWrapper } from ".";

export interface Recommendations {
  recommendations: TMDBListWrapper<Movie>;
}
