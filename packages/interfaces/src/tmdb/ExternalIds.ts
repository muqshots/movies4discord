export interface TVExternalIds {
  external_ids: {
    id: number;
    imdb_id: string | null;
    freebase_mid: string | null;
    freebase_id: string | null;
    tvdb_id: number | null;
    tvrage_id: number | null;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
  };
}
