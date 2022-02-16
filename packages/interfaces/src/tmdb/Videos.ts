import { Video } from "./Video";

export interface Videos {
  videos: { id: number; results: Video[] };
}
