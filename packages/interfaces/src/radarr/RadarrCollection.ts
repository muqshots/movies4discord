import { RadarrImage } from "./RadarrImage";

export interface RadarrCollection {
  name: string;
  tmdbId: number;
  images: RadarrImage[];
}
