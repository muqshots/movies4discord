import { TVWithMediaType } from "./TV";
import { MovieWithMediaType } from "./Movie";

export interface Person {
  profile_path: string | null;
  adult: boolean;
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  popularity: number;
}

export interface PersonWithMediaType extends Person {
  media_type: "person";
}
