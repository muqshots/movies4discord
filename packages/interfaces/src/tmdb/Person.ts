import { TVWithMediaType } from "./TV";
import { MovieWithMediaType } from "./Movie";

export interface Person {
  profile_path: string | null;
  adult: boolean;
  id: number;
  known_for: (MovieWithMediaType | TVWithMediaType)[];
  name: string;
  popularity: number;
}

export interface PersonWithMediaType extends Person {
  media_type: "person";
}
