export interface CrewMember {
  id: number;
  department?: string;
  original_language?: string;
  episode_count?: number;
  job?: string;
  overview?: string;
  origin_country?: string[];
  original_name?: string;
  vote_count?: number;
  name: string;
  media_type: string;
  popularity: number;
  credit_id?: string;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids?: number[];
  poster_path: string | null;
  profile_path: string | null;
  original_title?: string;
  video?: boolean;
  title: string;
  adult?: boolean;
  release_date: string;
}
