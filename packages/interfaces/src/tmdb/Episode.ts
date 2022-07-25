import { CrewMember } from "./CrewMember";

export interface Episode {
  air_date: string;
  episode_number: number;
  crew: CrewMember[];
  id: number;
  name: string;
  overview: string;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}
