import { Image } from "./Image";

export interface Images {
  images: { id: number; backdrops: Image[]; posters: Image[]; logos: Image[] };
}

export interface PersonImages {
  images: { id: number; profiles: Image[] };
}