import { Image } from "./Image";

export interface Images {
  images: { id: number; backdrops: Image[]; posters: Image[]; logos: Image[] };
}
